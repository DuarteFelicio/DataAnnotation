using DataAnnotation.Models;
using DataAnnotation.Models.Analysis;
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
		public Metadata InitAnalysis(string filepath, CsvFile csvFile)
		{
			DateTime timeInit = DateTime.Now;
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
			_context.CsvFile.Update(csvFile);
			_context.SaveChanges();

			CsvFileEx fileEx = new CsvFileEx(data, csvFile, _context);
			fileEx.InitIntraAnalysis();
			fileEx.InitDivisoesCompare();
			fileEx.CheckMetricsRelations();
			return new Metadata(csvFile, fileEx,timeInit,_context);
		}
	}
}
