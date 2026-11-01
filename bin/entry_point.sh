#!/bin/bash
set -euo pipefail

# Keep the mounted lockfile intact. Dependencies are installed in the image.
# Supervise the exact child PID so configuration reloads cannot kill other jobs.
jekyll_pid=''
cleanup() {
    if [[ -n "$jekyll_pid" ]]; then
        kill -TERM "$jekyll_pid" 2>/dev/null || true
        wait "$jekyll_pid" 2>/dev/null || true
    fi
}
trap 'cleanup; exit 0' TERM INT

while true; do
    bundle exec jekyll serve --watch --port=8080 --host=0.0.0.0 --livereload --trace --force_polling &
    jekyll_pid=$!
    while kill -0 "$jekyll_pid" 2>/dev/null; do
        if inotifywait -q -t 2 -e modify,move_self,delete_self _config.yml; then
            echo 'Configuration changed; restarting Jekyll'
            cleanup
            jekyll_pid=''
            break
        else
            watcher_status=$?
            # inotifywait uses 2 for a timeout; other errors should stop the service.
            if [[ "$watcher_status" != 2 ]]; then
                cleanup
                exit "$watcher_status"
            fi
        fi
    done
    if [[ -n "$jekyll_pid" ]]; then
        wait "$jekyll_pid"
        exit $?
    fi
done
