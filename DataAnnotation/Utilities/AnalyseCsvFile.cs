using DataAnnotation.Models;
using GenericParsing;
using System;
using System.Data;

namespace DataAnnotation.Utilities
{
	public class AnalyseCsvFile
	{
		private readonly DataAnnotationDBContext _context;
		public AnalyseCsvFile(DataAnnotationDBContext context)
		{
			_context = context;
		}
		public void InitAnalysis(string filepath, CsvFiles csvFile)
		{
			DataTable data = new DataTable();
			using (GenericParserAdapter parser = new GenericParserAdapter())
			{
				parser.SetDataSource(filepath);
				parser.ColumnDelimiter = ';';
				parser.FirstRowHasHeader = true;
				data = parser.GetDataTable();
			}
			csvFile.ColumnsCount = data.Columns.Count;
			csvFile.RowsCount = data.Rows.Count;
			using (_context)
			{
				_context.CsvFiles.Update(csvFile);
				_context.SaveChanges();
			}
			//csvFile.InitIntraAnalysis(data,_context);
			//csvFile.InitDivisoesCompare();
			//csvFile.CheckMetricsRelations();
			//Metadata metadata = new Metadata(file, filename);
		}
	}
}
