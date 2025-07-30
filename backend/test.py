import pyodbc

conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=SGPVSQL51.apac.bosch.com;DATABASE=DB_BDO14_SQL;UID=BDOCMP;PWD=BDOCMPSingapore2024+'
)
print("Connected!")
conn.close()
