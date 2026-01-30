#!/usr/bin/env python3
"""
정기적으로 데이터 파일을 업데이트하고 git에 커밋/푸시하는 스케줄러
GitHub Actions의 update-data-files.yml과 동일한 작업을 로컬에서 수행합니다.
"""

import subprocess
import time
import os
import sys
import logging
from datetime import datetime
import signal

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduled_update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 작업 디렉토리 설정
WORK_DIR = os.path.dirname(os.path.abspath(__file__))

# 실행할 Python 스크립트 목록
PYTHON_SCRIPTS = [
    'generate_pub_count.py',
    'generate_collabo_graph.py',
    'generate_keyword_similarity.py',
    'generate_scholar_citations.py',
    'sync_papers_from_scholar.py',
]

# git에 추가할 파일들
GIT_ADD_FILES = [
    '_data/pub_count.yml',
    '_data/scholar_citations.yml',
    'assets/json/collabo_graph.json',
    'assets/json/keyword_similarity.json',
    '_data/scholar_citations.yml',
    'assets/json/sync_papers_from_scholar.json',
]

# 실행 간격 (초 단위) - 기본값: 24시간 (86400초)
# 매일 실행하려면 86400, 매시간이면 3600, 테스트용 1분이면 60
INTERVAL_SECONDS = 86400  # 24시간

# 종료 플래그
running = True


def signal_handler(signum, frame):
    """시그널 핸들러 - 프로세스 종료 시 호출"""
    global running
    logger.info("종료 신호 수신. 프로세스를 종료합니다...")
    running = False


def run_command(command, cwd=None):
    """명령어 실행 및 결과 반환"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd or WORK_DIR,
            capture_output=True,
            text=True,
            timeout=300  # 5분 타임아웃
        )
        if result.returncode != 0:
            logger.error(f"명령어 실패: {command}")
            logger.error(f"stderr: {result.stderr}")
            return False, result.stderr
        return True, result.stdout
    except subprocess.TimeoutExpired:
        logger.error(f"명령어 타임아웃: {command}")
        return False, "Timeout"
    except Exception as e:
        logger.error(f"명령어 실행 오류: {command}, 에러: {e}")
        return False, str(e)


def git_pull():
    """git pull 실행"""
    logger.info("git pull 실행 중...")
    success, output = run_command("git pull")
    if success:
        logger.info("git pull 완료")
    else:
        logger.warning(f"git pull 실패: {output}")
    return success


def run_python_scripts():
    """Python 스크립트들 실행"""
    results = []
    for script in PYTHON_SCRIPTS:
        script_path = os.path.join(WORK_DIR, script)
        if not os.path.exists(script_path):
            logger.warning(f"스크립트를 찾을 수 없음: {script}")
            results.append((script, False, "파일 없음"))
            continue
        
        logger.info(f"실행 중: {script}")
        success, output = run_command(f"python3 {script}")
        if success:
            logger.info(f"완료: {script}")
        else:
            logger.error(f"실패: {script}")
        results.append((script, success, output))
    
    return results


def git_commit_and_push():
    """변경사항 확인 후 커밋 및 푸시"""
    # 변경사항 확인
    success, output = run_command("git diff --quiet")
    if success:
        logger.info("변경사항 없음. 커밋하지 않습니다.")
        return True
    
    logger.info("변경사항 발견. 커밋 및 푸시 진행...")
    
    # git add
    files_to_add = " ".join(GIT_ADD_FILES)
    success, output = run_command(f"git add {files_to_add}")
    if not success:
        logger.error(f"git add 실패: {output}")
        return False
    
    # git commit
    commit_msg = f"chore: update data files [scheduled] - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    success, output = run_command(f'git commit -m "{commit_msg}"')
    if not success:
        logger.error(f"git commit 실패: {output}")
        return False
    logger.info("git commit 완료")
    
    # git push
    success, output = run_command("git push")
    if not success:
        logger.error(f"git push 실패: {output}")
        return False
    logger.info("git push 완료")
    
    return True


def run_scheduled_task():
    """전체 스케줄 작업 실행"""
    logger.info("=" * 60)
    logger.info(f"스케줄 작업 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)
    
    # 1. git pull
    git_pull()
    
    # 2. Python 스크립트 실행
    results = run_python_scripts()
    
    # 결과 요약
    success_count = sum(1 for _, success, _ in results if success)
    logger.info(f"스크립트 실행 결과: {success_count}/{len(PYTHON_SCRIPTS)} 성공")
    
    # 3. git commit & push
    git_commit_and_push()
    
    logger.info(f"스케줄 작업 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)


def main():
    """메인 함수 - 스케줄러 실행"""
    global running
    
    # 시그널 핸들러 등록
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    logger.info("=" * 60)
    logger.info("데이터 파일 업데이트 스케줄러 시작")
    logger.info(f"작업 디렉토리: {WORK_DIR}")
    logger.info(f"실행 간격: {INTERVAL_SECONDS}초 ({INTERVAL_SECONDS/3600:.1f}시간)")
    logger.info("종료하려면 Ctrl+C를 누르세요.")
    logger.info("=" * 60)
    
    # 시작 시 즉시 한 번 실행
    run_scheduled_task()
    
    # 주기적 실행
    while running:
        logger.info(f"다음 실행까지 {INTERVAL_SECONDS}초 대기...")
        
        # 인터럽트 가능한 대기
        wait_start = time.time()
        while running and (time.time() - wait_start) < INTERVAL_SECONDS:
            time.sleep(1)
        
        if running:
            run_scheduled_task()
    
    logger.info("스케줄러가 종료되었습니다.")


if __name__ == "__main__":
    main()
