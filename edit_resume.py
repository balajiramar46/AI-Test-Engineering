from docx import Document
f=r'C:\AI-Test-Engineering\Balaji_QA_Resume_26_updated.docx'
d=Document(f)
for p in d.paragraphs:
    if p.text.startswith('Continuous Integration Tools'):
        p.runs[0].text='CI Tools: Jenkins, GitHub Actions | Version Control: GitHub'
        for r in p.runs[1:]: r.text=''
        break
d.save(f)
print(next(p.text for p in d.paragraphs if p.text.startswith('CI Tools:')))
