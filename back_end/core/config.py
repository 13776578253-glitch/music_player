from pathlib import Path

# 项目根目录 back_end/
BASE_DIR = Path(__file__).resolve().parents[1]

# 日志
LOG_DIR = BASE_DIR / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "music_player.log"
LOG_LEVEL = "INFO"

# 数据库
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_FILE = DATA_DIR / "music.db"

