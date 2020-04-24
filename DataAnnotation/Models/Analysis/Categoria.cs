using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
	public class Categoria
	{
		public string nome { get; set; }
		public List<Categoria> categoriasfilhas { get; set; }
		public List<string> metricas { get; set; }
		public List<CatMetrics> columnMetrics { get; set; }
		public string CatValue { get; set; }
		public int CatValueId { get; set; }
		public int CatId { get; set; }
		public int? ParentId { get; set; }
	}

	public class CatMetrics
	{
		public string ColumnName { get; set; }
		public int ColumnIndex { get; set; }
	}
}

