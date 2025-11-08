module Jekyll
  module HideCustomBibtex
    def hideCustomBibtex(input)
	    keywords = @context.registers[:site].config['filtered_bibtex_keywords']

      # Remove any entire lines whose field name matches the filtered keywords.
      # Be robust to:
      # - leading spaces/tabs
      # - either braces {...} or quotes "..."
      # - optional trailing comma and trailing spaces
      # - CRLF or LF line endings
      # - case differences in field name
      keywords.each do |keyword|
        pattern = /^(?:[ \t]*)\b#{Regexp.escape(keyword)}\b[ \t]*=[ \t]*(\{[^\n]*\}|"[^"\n]*")[ \t]*,?[ \t]*(?:\r?\n|\z)/i
        input = input.gsub(pattern, '')
      end

      # Clean superscripts in author lists (keep the line but strip special markers)
      author_pattern = /^(?:[ \t]*)\bauthor\b[ \t]*=[ \t]*(\{[^\n]*\}|"[^"\n]*")[ \t]*,?[ \t]*(?:\r?\n|\z)/i
      input = input.gsub(author_pattern) { |line| line.gsub(/[*†‡§¶‖&^]/, '') }

      return input
    end
  end
end

Liquid::Template.register_filter(Jekyll::HideCustomBibtex)
