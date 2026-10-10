"""Read-only shared exact2024 suspension/brake audit checks."""
import runpy
from pathlib import Path
runpy.run_path(str(Path(__file__).parent.parent/'yamaha-2024-suspension/validate_review.py'),run_name='__main__')
