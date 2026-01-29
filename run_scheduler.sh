#!/bin/bash
#
# 데이터 파일 업데이트 스케줄러 관리 스크립트
# 사용법:
#   ./run_scheduler.sh start   - 백그라운드에서 스케줄러 시작
#   ./run_scheduler.sh stop    - 스케줄러 종료
#   ./run_scheduler.sh status  - 스케줄러 상태 확인
#   ./run_scheduler.sh restart - 스케줄러 재시작
#   ./run_scheduler.sh run     - 포그라운드에서 실행 (테스트용)
#   ./run_scheduler.sh once    - 한 번만 실행
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$SCRIPT_DIR/.scheduler.pid"
LOG_FILE="$SCRIPT_DIR/scheduled_update.log"
PYTHON_SCRIPT="$SCRIPT_DIR/scheduled_update.py"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}스케줄러가 이미 실행 중입니다 (PID: $PID)${NC}"
            return 1
        else
            rm -f "$PID_FILE"
        fi
    fi
    
    echo -e "${GREEN}스케줄러를 백그라운드에서 시작합니다...${NC}"
    cd "$SCRIPT_DIR"
    nohup python3 "$PYTHON_SCRIPT" >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo -e "${GREEN}스케줄러가 시작되었습니다 (PID: $(cat $PID_FILE))${NC}"
    echo -e "로그 파일: $LOG_FILE"
    echo -e "로그 확인: tail -f $LOG_FILE"
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}스케줄러를 종료합니다 (PID: $PID)...${NC}"
            kill "$PID"
            sleep 2
            if ps -p "$PID" > /dev/null 2>&1; then
                echo -e "${RED}강제 종료합니다...${NC}"
                kill -9 "$PID"
            fi
            rm -f "$PID_FILE"
            echo -e "${GREEN}스케줄러가 종료되었습니다.${NC}"
        else
            echo -e "${YELLOW}스케줄러가 실행 중이 아닙니다.${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}PID 파일이 없습니다. 스케줄러가 실행 중이 아닌 것 같습니다.${NC}"
    fi
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${GREEN}스케줄러가 실행 중입니다 (PID: $PID)${NC}"
            echo ""
            echo "프로세스 정보:"
            ps -p "$PID" -o pid,ppid,%cpu,%mem,etime,command
            echo ""
            echo "최근 로그 (마지막 10줄):"
            tail -n 10 "$LOG_FILE"
            return 0
        else
            echo -e "${RED}스케줄러가 종료되었습니다 (PID 파일에 저장된 PID: $PID)${NC}"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        echo -e "${YELLOW}스케줄러가 실행 중이 아닙니다.${NC}"
        return 1
    fi
}

run_foreground() {
    echo -e "${GREEN}스케줄러를 포그라운드에서 실행합니다...${NC}"
    echo -e "종료하려면 Ctrl+C를 누르세요."
    cd "$SCRIPT_DIR"
    python3 "$PYTHON_SCRIPT"
}

run_once() {
    echo -e "${GREEN}데이터 업데이트를 한 번 실행합니다...${NC}"
    cd "$SCRIPT_DIR"
    
    echo "1. git pull 실행..."
    git pull
    
    echo ""
    echo "2. generate_pub_count.py 실행..."
    python3 generate_pub_count.py
    
    echo ""
    echo "3. generate_collabo_graph.py 실행..."
    python3 generate_collabo_graph.py
    
    echo ""
    echo "4. generate_keyword_similarity.py 실행..."
    python3 generate_keyword_similarity.py
    
    echo ""
    echo "5. generate_scholar_citations.py 실행..."
    python3 generate_scholar_citations.py
    
    echo ""
    echo "6. 변경사항 확인 및 커밋..."
    if ! git diff --quiet; then
        git add _data/pub_count.yml _data/scholar_citations.yml assets/json/collabo_graph.json assets/json/keyword_similarity.json
        git commit -m "chore: update data files [manual] - $(date '+%Y-%m-%d %H:%M:%S')"
        git push
        echo -e "${GREEN}커밋 및 푸시 완료!${NC}"
    else
        echo -e "${YELLOW}변경사항이 없습니다.${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}완료!${NC}"
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    run)
        run_foreground
        ;;
    once)
        run_once
        ;;
    *)
        echo "사용법: $0 {start|stop|status|restart|run|once}"
        echo ""
        echo "  start   - 백그라운드에서 스케줄러 시작 (24시간 주기)"
        echo "  stop    - 스케줄러 종료"
        echo "  status  - 스케줄러 상태 확인"
        echo "  restart - 스케줄러 재시작"
        echo "  run     - 포그라운드에서 실행 (테스트용)"
        echo "  once    - 한 번만 실행"
        exit 1
        ;;
esac

exit 0
