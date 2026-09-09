import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

visitors_path = ROOT / "site" / "data" / "visitors.json"
visitors = json.loads(visitors_path.read_text())
visitor = {
    "name": "Luigi Pistaferri",
    "institution": "Stanford University",
    "webpage": "https://web.stanford.edu/~pista/",
    "startDate": "2026-09-15",
    "endDate": "2026-12-15",
    "office": "Stephen Hansen's Office",
}
visitors = [item for item in visitors if item["name"] != visitor["name"]]
visitors.append(visitor)
visitors.sort(key=lambda item: (item.get("startDate") or "9999-99-99", item["name"]))
visitors_path.write_text(json.dumps(visitors, indent=2, ensure_ascii=False) + "\n")

events_path = ROOT / "site" / "data" / "events.json"
events = json.loads(events_path.read_text())
for event in events:
    if event["id"] == "ifs-empirical-industrial-organisation-conference":
        event["organisers"] = [
            "Joao Granja (UCL)",
            "Lars Nesheim (UCL)",
            "Jakob Schneebacher (IFS)",
            "Alessandro Iaria (Bristol University)",
        ]
events_path.write_text(json.dumps(events, indent=2, ensure_ascii=False) + "\n")

titles = {
    "Klaus Adam": "Professor", "Beatriz Armendariz": "Associate Professor",
    "Mark Armstrong": "Professor", "Thanos Athanasopoulos": "Lecturer (Teaching)",
    "Hadar Avivi": "Lecturer", "Saleem Bahaj": "Associate Professor",
    "Richard Blundell": "Ricardo Professor of Political Economy", "Wendy Carlin": "Professor",
    "Pedro Carneiro": "Professor", "Parama Chaudhury": "Professor (Teaching) / Pro-Vice Provost (Education – Student Academic Experience)",
    "Andrew Chesher": "WS Jevons Professor of Economics and Economic Measurement", "Gabriella Conti": "Professor",
    "Lucas Conwell": "Lecturer", "Adrien Couturier": "Lecturer", "Martin Cripps": "Professor",
    "Wei Cui": "Associate Professor", "Aureo De Paula Neto": "Professor", "Benjamin Deaner": "Lecturer",
    "Christian Dustmann": "Professor", "François Gerard": "Professor", "Raffaella Giacomini": "Professor",
    "Duarte Goncalves Dias Da Silva": "Lecturer", "Hugh Goodacre": "Lecturer (Teaching)",
    "Alexander Gorbenko": "Professor", "Joao Granja De Almeida": "Lecturer", "Antonio Guarino": "Professor",
    "Stephen Hansen": "Professor", "Jonas Hjort": "Professor", "Philippe Jehiel": "Professor",
    "Deniz Kattwinkel": "Lecturer", "Dennis Kristensen": "Professor", "Hyejin Ku": "Associate Professor",
    "Valerie Lechene": "Professor", "Daniel Lewis": "Associate Professor", "Dunli Li": "Associate Professor (Teaching)",
    "Attila Lindner": "Professor", "Frederic Malherbe": "Professor", "Kalina Manova": "Professor",
    "Marta Morrazoni": "Lecturer", "Ramin Nassehi": "Associate Professor (Teaching)", "Lars Nesheim": "Professor",
    "Marguerite Obolensky": "Lecturer", "Alan Olivi": "Lecturer", "Duygu Ozdemir": "Lecturer (Teaching)",
    "Rodrigo Paiva Guimaraes": "Lecturer (Teaching)", "Suphanit Piyapromdee": "Associate Professor",
    "Franck Portier": "Professor", "Fabien Postel-Vinay": "Head of Department, Professor",
    "Peter Postl": "Professor (Teaching)", "Ian Preston": "Professor", "Lukasz Rachel": "Lecturer",
    "Imran Rasul": "Professor", "Morten Ravn": "Professor", "Jose-Victor Rios-Rull": "Professorial Research Fellow",
    "Vasiliki Skreta": "Professor", "Ran Spiegler": "Professor", "Vincent Sterk": "Professor",
    "Liyang Sun": "Lecturer", "Alessia Testa": "Lecturer (Teaching)", "Michael Thaler": "Lecturer",
    "Michela Tincani": "Associate Professor", "Gabriel Ulyssea": "Associate Professor",
    "Marcos Angel Vera-Hernandez": "Professor", "Frank Witte": "Professor (Teaching)",
    "Ming Yang": "Associate Professor", "Xiao Yin": "Lecturer", "Ji Hee Yoon": "Lecturer",
    "Andrei Zeleneev": "Lecturer",
}

initials = {
    "Aureo De Paula Neto": "P", "Duarte Goncalves Dias Da Silva": "G",
    "Joao Granja De Almeida": "G", "Rodrigo Paiva Guimaraes": "P",
    "Marcos Angel Vera-Hernandez": "V",
}
staff_path = ROOT / "research_staff" / "staff.json"
staff = json.loads(staff_path.read_text())
for person in staff:
    person["title"] = titles.get(person["name"], "")
    person["personalUrl"] = ""
    person["surnameInitial"] = initials.get(person["name"], person["name"].split()[-1][0].upper())
staff_path.write_text(json.dumps(staff, indent=2, ensure_ascii=False) + "\n")
(ROOT / "site" / "data" / "people.json").write_text(json.dumps(staff, indent=2, ensure_ascii=False) + "\n")

print(json.dumps({"visitors": len(visitors), "events": len(events), "people": len(staff)}))
