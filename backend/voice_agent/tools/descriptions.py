from pathlib import Path

# Path to tools_description directory
DESCRIPTIONS_DIR = Path(__file__).parent.parent / "tools_description"

def _read_md(filename: str) -> str:
    filepath = DESCRIPTIONS_DIR / filename
    if filepath.exists():
        return filepath.read_text(encoding="utf-8").strip()
    return ""

# Will pre load in RAM When server starts. 
GET_DOCTORS_INFO_DESC = _read_md("get_doctors_info.md")
GET_LAB_TEST_CATALOG_DESC = _read_md("get_lab_test_catalog.md")
GET_LAB_OPERATIONAL_TIMINGS_DESC = _read_md("get_lab_operational_timings.md")
GET_CLINIC_OPERATIONAL_TIMINGS_DESC = _read_md("get_clinic_operational_timings.md")
GET_CLINIC_FAQS_DESC = _read_md("get_clinic_faqs.md")