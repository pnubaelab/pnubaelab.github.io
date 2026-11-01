# Run with bundle exec ruby utils/validate_scholar_timeouts.rb.
# All HTTP calls and rate-limit sleeps are stubbed; no network is used.
require 'liquid'
require 'net/http'
require 'stringio'
require_relative '../_plugins/google-scholar-citations'

def check(condition, message)
  raise message unless condition
end

tag_class = Jekyll::GoogleScholarCitationsTag
original_open = URI.method(:open)
original_sleep = tag_class.instance_method(:sleep)
original_stdout = $stdout
requests = []
sleeps = []
response = '<html><meta name="description" content="Cited by 123"></html>'
failure = nil

tag_class.send(:define_method, :sleep) { |delay| sleeps << delay }
URI.define_singleton_method(:open) do |url, options|
  requests << [url, options]
  raise failure if failure
  StringIO.new(response)
end

begin
  $stdout = StringIO.new
  template = Liquid::Template.parse('{% google_scholar_citations scholar article %}')
  tag_class::Citations.clear
  result = template.render!('scholar' => 'test-scholar', 'article' => 'success')
  check(result == '120', "unexpected successful citation formatting: #{result.inspect}")
  check(requests.length == 1, 'expected one successful request')
  options = requests.first.last
  check(options[:open_timeout] == 5, 'open timeout must be five seconds')
  check(options[:read_timeout] == 10, 'read timeout must be ten seconds')
  check(options['User-Agent'] == "Ruby/#{RUBY_VERSION}", 'preserve User-Agent header')
  check(requests.first.first.include?('test-scholar:success'), 'preserve citation URL')

  [Net::OpenTimeout, Net::ReadTimeout].each do |timeout_class|
    article = timeout_class.name
    failure = timeout_class.new('stubbed network timeout')
    before_requests = requests.length
    before_sleeps = sleeps.length
    first = template.render!('scholar' => 'test-scholar', 'article' => article)
    cached = template.render!('scholar' => 'test-scholar', 'article' => article)
    check(first == 'N/A' && cached == 'N/A', 'timeouts must retain N/A fallback')
    check(tag_class::Citations[article] == 'N/A', 'timeout fallback must be cached')
    check(requests.length == before_requests + 1, 'cached fallback must not retry HTTP')
    check(sleeps.length == before_sleeps + 1, 'cached fallback must not sleep again')
  end
  check(sleeps.all? { |delay| (1.5..3.5).cover?(delay) }, 'preserve rate-limit delay range')
ensure
  URI.define_singleton_method(:open, original_open)
  tag_class.send(:define_method, :sleep, original_sleep)
  tag_class.send(:private, :sleep)
  tag_class::Citations.clear
  $stdout = original_stdout
end

puts 'Scholar HTTP timeout arguments, successful response and cached N/A fallback checks passed.'
