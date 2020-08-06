/*
 * Classe de autoria de Nuno Ribeiro reutilizada.
 */

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
	public class CsvFileEx
	{
		public CsvFile CsvFile { get; set; }

		private readonly DataAnnotationDBContext _context;

		public List<CsvColumn> Columns { get; set; }
		public DataTable Data { get; set; }
		public List<DivisaoTerritorial>[] RowGeographic { get; set; }
		//public List<Tree> RowHierarchies { get; set; }
		public Categoria RootCategory { get; set; }


		public CsvFileEx(DataTable data,CsvFile file, DataAnnotationDBContext _context)
		{
			CsvFile = file;
			this._context = _context;
			this.Columns = new List<CsvColumn>();
			Data = data;
		}


		/// <summary>
		/// método que avalia individualmente cada coluna que compõe o ficheiro
		/// </summary>
		/// <param name="socket"></param>
		public void InitIntraAnalysis()
		{
			foreach (DataColumn column in this.Data.Columns)
			{
				CsvColumn csvColumn = new CsvColumn(CsvFile,column.ColumnName, column.Ordinal,_context);
				csvColumn.Analyse(Data.Rows);
				this.Columns.Add(csvColumn);
			}
		}

		/// <summary>
		/// Faz o cruzamento entre todas as colunas que contêm Divisões Territoriais para verificar
		/// as que correspondem nas mesmas linhas
		/// </summary>
		/// <param name="socket"></param>
		public void InitDivisoesCompare()
		{
			List<CsvColumn> domainsCol = this.Columns.FindAll(x => x.MetricOrDimension.Equals("dimension") && x.Geographic != null && (x.Geographic.Divisoes.Count > 0 || x.Geographic.Unidades.Count > 0));
			if (domainsCol.Count == 0)
				return;

			this.RowGeographic = new List<DivisaoTerritorial>[CsvFile.RowsCount.Value];
			List<DivisaoTerritorial>[] auxRows = new List<DivisaoTerritorial>[CsvFile.RowsCount.Value];


			int listIndex = -1;
			int colsLength = domainsCol.Count;
			foreach (CsvColumn col in domainsCol)
			{
				listIndex++;
				foreach (DivisaoTerritorial divisao in col.Geographic.Divisoes)
				{
					foreach (int row in divisao.Rows)
					{
						if (auxRows[row] == null)
							auxRows[row] = new List<DivisaoTerritorial>();

						DivisaoTerritorial auxDiv = auxRows[row].Find(x => x.DivisoesTerritoriaisId == divisao.DivisoesTerritoriaisId);
						if (auxDiv == null)
						{
							auxDiv = new DivisaoTerritorial
							{
								Count = 1,
								DivisoesTerritoriaisId = divisao.DivisoesTerritoriaisId,
								Nome = divisao.Nome,
								UnidadesDivisoesId = divisao.UnidadesDivisoesId,
								UnidadesTerritoriaisId = divisao.UnidadesTerritoriaisId
							};
							auxRows[row].Add(auxDiv);
						}
						else
							auxDiv.Count++;
					}
				}
				foreach (DivisaoTerritorial divisao in col.Geographic.Unidades)
				{
					foreach (int row in divisao.Rows)
					{
						if (auxRows[row] == null)
							auxRows[row] = new List<DivisaoTerritorial>();

						DivisaoTerritorial auxDiv = auxRows[row].Find(x => x.DivisoesTerritoriaisId == divisao.DivisoesTerritoriaisId);
						if (auxDiv == null)
						{
							auxDiv = new DivisaoTerritorial
							{
								Count = 1,
								DivisoesTerritoriaisId = divisao.DivisoesTerritoriaisId,
								Nome = divisao.Nome,
								UnidadesDivisoesId = divisao.UnidadesDivisoesId,
								UnidadesTerritoriaisId = divisao.UnidadesTerritoriaisId
							};
							auxRows[row].Add(auxDiv);
						}
						else
							auxDiv.Count++;
					}
				}
			}

			this.RowGeographic = new List<DivisaoTerritorial>[CsvFile.RowsCount.Value];
			for (int i = 0; i < auxRows.Length; i++)
			{
				if (auxRows[i] == null)
					continue;

				var a = auxRows[i].OrderByDescending(x => x, new DivisaoTerritorialComparer());

				this.RowGeographic[i] = new List<DivisaoTerritorial>();
				int max = 0;

				foreach (DivisaoTerritorial dt in a)
				{
					if (dt.Count >= max)
					{
						this.RowGeographic[i].Add(dt);
						max = dt.Count;
					}
				}
			}

  
		}

		/// <summary>
		/// método que constroi a Radix Tree para encontrar possíveis relações entre as colunas métricas
		/// </summary>
		/// <param name="socket"></param>
		public void CheckMetricsRelations()
		{
			List<CsvColumn> columns = this.Columns.FindAll(x => x.MetricOrDimension.Equals("metric"));
			List<ColumnNode> tree = FindColumnsHierarchy(columns);
			
			this.RootCategory = GenerateCategoriesTree(tree);        
		}

		/// <summary>
		/// gera uma lista de categorias a partir de uma Radix Tree
		/// </summary>
		/// <param name="tree"></param>
		/// <returns></returns>
		private Categoria GenerateCategoriesTree(List<ColumnNode> tree)
		{
			int nextId = 1;
			Categoria root = new Categoria { ParentId = null, CatId = nextId++, nome = "root", categoriasfilhas = new List<Categoria>(), metricas = new List<string>(), columnMetrics = new List<CatMetrics>() };

			foreach (ColumnNode node in tree)
				AddNodeToCategory(node, root, ref nextId);

			return root;
		}

		private void AddNodeToCategory(ColumnNode node, Categoria parent, ref int nextIndex)
		{
			if (node.hasValue && node.nodes.Count == 0)
			{
				parent.metricas.Add(node.title);
				parent.columnMetrics.Add(new CatMetrics { ColumnName = node.title, ColumnIndex = node.id });
				return;
			}

			Categoria categoria = new Categoria { ParentId = parent.CatId, CatId = nextIndex++, nome = node.title, categoriasfilhas = new List<Categoria>(), metricas = new List<string>(), columnMetrics = new List<CatMetrics>() };
			parent.categoriasfilhas.Add(categoria);
			if (node.hasValue)
			{
				categoria.CatValue = node.title;
				categoria.CatValueId = node.id;
			}
			foreach (ColumnNode childNode in node.nodes)
				AddNodeToCategory(childNode, categoria, ref nextIndex);

		}

		/// <summary>
		/// cria uma lista orientada por uma hierarquia de sintaxe
		/// (Radix Tree)
		/// </summary>
		/// <param name="columns"></param>
		/// <returns></returns>
		private List<ColumnNode> FindColumnsHierarchy(List<CsvColumn> columns)
		{
			Tree tree = new Tree { RootNodes = new List<Node>() };
			foreach (CsvColumn column in columns)
			{
				Node parentNode = null;
				string colName = column.ColumnName;
				for (int i = 1; i <= colName.Length; i++)
				{
					string id = colName.Substring(0, i);
					if (parentNode == null)
					{
						parentNode = tree.GetRootNode(id);
						if (parentNode == null)
						{
							parentNode = new Node
							{
								Children = new List<Node>(),
								HasValue = id.Length == colName.Length,
								Id = id,
								ParentNode = null,
								RowIndex = column.ColumnIndex
							};
							if (parentNode.HasValue)
								parentNode.Value = colName;

							tree.AddRoot(parentNode);
						}
						continue;
					}

					Node child = parentNode.FindChild(id);
					if (child != null)
					{
						if (id.Length == colName.Length)
						{
							child.HasValue = true;
							child.RowIndex = column.ColumnIndex;
							child.Value = colName;
						}
						else
							parentNode = child;
					}
					else
					{
						child = new Node
						{
							ParentNode = parentNode,
							Children = new List<Node>(),
							HasValue = id.Length == colName.Length,
							Id = id,
							RowIndex = column.ColumnIndex
						};
						if (child.HasValue)
							child.Value = colName;

						parentNode.AddChild(child);

						parentNode = child;
					}
				}
			}

			List<ColumnNode> nodes = tree.ProduceCleanColumnTree();

			List<ColumnNode> newnodes = new List<ColumnNode>();

			foreach (ColumnNode node in nodes)
				AddNodeToParent(node, newnodes, null);

			return newnodes;
		}

		private void AddNodeToParent(ColumnNode node, List<ColumnNode> nodes, ColumnNode oldparent)
		{
			if (oldparent == null)
			{
				ColumnNode newNode = new ColumnNode(node);
				nodes.Add(newNode);
				foreach (ColumnNode childNode in node.nodes)
					AddNodeToParent(childNode, newNode.nodes, node);
				return;
			}

			if (oldparent.nodes.Count == 1 && !node.hasValue)
			{
				foreach (ColumnNode childNode in node.nodes)
					AddNodeToParent(childNode, nodes, node);
				return;
			}

			List<ColumnNode> childrenVal = node.nodes.FindAll(x => x.hasValue);
			if (childrenVal.Count == 1 && !childrenVal[0].title.Equals(node.title) && childrenVal[0].nodes.Count > 0)
			{
				foreach (ColumnNode childNode in node.nodes)
					AddNodeToParent(childNode, nodes, oldparent);
				return;
			}

			ColumnNode newChildNode = new ColumnNode(node);
			nodes.Add(newChildNode);
			foreach (ColumnNode childNode in node.nodes)
				AddNodeToParent(childNode, newChildNode.nodes, node);
			return;
		}
	}
}
