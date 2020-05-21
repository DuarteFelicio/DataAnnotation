using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Data;
using Microsoft.EntityFrameworkCore;
using AnalyseFileWorkerService.Models;

namespace DataAnnotation.Models.Analysis
{
	public class CsvColumn
	{
		public CsvFile CsvFile { get; set; }
		public int ColumnIndex { get; set; }
		public string ColumnName { get; set; }
		public int NullsCount { get; set; }
		public bool AllDifferent { get; set; }
		public string MetricOrDimension { get; set; }
		public string ColClass { get; set; }

		public DomainInformation Geographic { get; set; }

		/// <summary>
		/// Lista (implementada como um dicionário) de todos os tipos diferentes que existem nos valores da coluna
		/// </summary>
		public Dictionary<string, int> DifferentTypes { get; set; }

		/// <summary>
		/// Lista (implementada como um dicionário) dos diferentes tipos numéricos que existem nos valores da coluna
		/// </summary>
		public Dictionary<string, int> DifferentNumericTypes { get; set; }

		/// <summary>
		/// Lista (implementada como um dicionário) de valores únicos que compõem os valores da coluna
		/// </summary>
		public Dictionary<string, DistinctValue> UniqueValues { get; set; }
		public int CountUniqueValues { get; set; }

		/// <summary>
		/// conexão ao repositório Knowledge Database
		/// </summary>
		private readonly DataAnnotationDBContext _context;

		private const decimal percentageMinimumGeoUnique = 0.5m;
		private const decimal percentageUniqueValuesSample = 0.1m;


		public CsvColumn(CsvFile file, string name, int index, DataAnnotationDBContext _context)
		{
			CsvFile = file;
			ColumnIndex = index;
			ColumnName = name;
			NullsCount = 0;
			AllDifferent = false;
			Geographic = new DomainInformation
			{
				Divisoes = new List<DivisaoTerritorial>(),
				Unidades = new List<DivisaoTerritorial>()
			};

			DifferentTypes = new Dictionary<string, int>();
			UniqueValues = new Dictionary<string, DistinctValue>();
			DifferentNumericTypes = new Dictionary<string, int>();

			this._context = _context;
		}

		/// <summary>
		/// método que analisa todos os valores da coluna e verifica os domínios geográficos
		/// </summary>
		/// <param name="rows"></param>
		public void Analyse(DataRowCollection rows)
		{
			TypeAnalysis(rows);
			CheckMetricOrDimension();
			CheckDomain();
			this.CountUniqueValues = this.UniqueValues.Count;
			if (this.CountUniqueValues > 20)
				this.UniqueValues = null;
		}

		/// <summary>
		/// método que verifica se a coluna está associada um domínio geográfico
		/// </summary>
		public void CheckDomain()
		{
			if (this.MetricOrDimension.Equals("metric"))
			{
				// é uma coluna métrica, não pode ser de domínio geográfico
				return;
			}

			if (this.UniqueValues.Count == 1 && this.NullsCount == 0)
			{
				this.ColClass = "file";
			}

			if (!CheckPossibleGeographicDomain())
			{
				//a coluna não aparente estar associada a domínios geográficos
				return;
			}

			List<DivisaoTerritorial> divisoesAll = new List<DivisaoTerritorial>();
			divisoesAll.Add(new DivisaoTerritorial { DivisoesTerritoriaisId = null, Nome = "Geo_Unknown", Rows = new List<int>() });
			int geoDomainsFound = 0;
			foreach (KeyValuePair<string, DistinctValue> val in this.UniqueValues)
			{
				if (val.Value.Divisoes == null)
					SetDivisoesTerritoriais(val);

				if (val.Value.Divisoes.Count == 0)
				{
					divisoesAll[0].Rows.AddRange(val.Value.Rows);
					continue;
				}
				else
					geoDomainsFound++;

				foreach (DivisaoTerritorial divisao in val.Value.Divisoes)
				{
					divisao.Rows = new List<int>(val.Value.Rows);

					DivisaoTerritorial colDiv = divisoesAll.Find(x => x.DivisoesTerritoriaisId == divisao.DivisoesTerritoriaisId);

					if (colDiv == null)
						divisoesAll.Add(divisao);
					else
					{
						foreach (int row in divisao.Rows)
							if (colDiv.Rows.Contains(row))
								continue;
							else
								colDiv.Rows.Add(row);
					}
				}
			}

			if (geoDomainsFound == 0 || geoDomainsFound < Convert.ToInt32(Math.Round(this.UniqueValues.Count * percentageMinimumGeoUnique)))
				return; // A quantidade de valores associada a domínios geográficos é inferior ao mínimo aceitável. A coluna não é considerada como Domínio Geográfico

			foreach (DivisaoTerritorial dt in divisoesAll)
			{
				if (!dt.DivisoesTerritoriaisId.HasValue)
					continue;

				if (dt.IsUnidadeDivisao == 1)
				{
					this.Geographic.Divisoes.Add(dt);
					continue;
				}

				if (dt.UnidadesTerritoriaisId.HasValue)
				{
					this.Geographic.Unidades.Add(dt);
					this.Geographic.Divisoes.Add(dt);
				}
				else
					this.Geographic.Divisoes.Add(dt);
			}
		}

		/// <summary>
		/// Verifica se uma valor está associado a divisões territoriais
		/// guarda a lista de divisões territoriais no valor se alguma for encontrada
		/// </summary>
		/// <param name="val"></param>
		private void SetDivisoesTerritoriais(KeyValuePair<string, DistinctValue> val)
		{
			List<DivisaoTerritorial> divisoes = CheckDivisoesTerritoriais(val.Key);
			if (divisoes.Count == 0)
			{
				val.Value.Divisoes = new List<DivisaoTerritorial>();
				return;
			}
			val.Value.Divisoes = divisoes;
		}

		/// <summary>
		/// method that evaluates if the column is candidate to have a geographic related domain
		/// </summary>
		/// <returns></returns>
		private bool CheckPossibleGeographicDomain()
		{
			int numberOfValues = this.UniqueValues.Count;
			Random random = new Random();

			if (numberOfValues <= 100)
				return true; // just a few records, can confirm them all

			int numberOfValuesToCheck = Convert.ToInt32(Math.Round(numberOfValues * percentageUniqueValuesSample));
			int minimumNumberOfGeoValues = Convert.ToInt32(Math.Round(numberOfValuesToCheck * percentageMinimumGeoUnique));

			List<int> alreadyChecked = new List<int>();
			int geoDomainsFound = 0;
			for (int i = 0; i < numberOfValuesToCheck; i++)
			{
				int index = GetNextIndex(random, numberOfValues, alreadyChecked);
				KeyValuePair<string, DistinctValue> val = this.UniqueValues.ElementAt(index);
				SetDivisoesTerritoriais(val);
				if (val.Value.Divisoes.Count > 0)
					geoDomainsFound++;
				else
				{
					if (i > minimumNumberOfGeoValues && geoDomainsFound == 0)
						break; //já foram verificados o número mínimo de valores e ainda não foi encontrado um domínio geográfico
				}
			}

			if (geoDomainsFound > minimumNumberOfGeoValues)
				return true; // o número de valores com domínio geográfico é superior ao mínimo aceitável
			else
				return false; // o número de valores com domínio geográfico é inferiro ao mínimo aceitável
		}

		/// <summary>
		/// gera um número aleatoriamente que ainda não tenha sido selecionado
		/// </summary>
		/// <param name="random"></param>
		/// <param name="maximus"></param>
		/// <param name="alreadyChecked"></param>
		/// <returns></returns>
		private int GetNextIndex(Random random, int maximus, List<int> alreadyChecked)
		{
			int index = -1;
			bool done = false;
			while (!done)
			{
				index = random.Next(maximus - 1);
				if (!alreadyChecked.Contains(index))
				{
					alreadyChecked.Add(index);
					done = true;
				}
			}

			return index;
		}

		/// <summary>
		/// verifica a existência de Divisoes Territoriais ou Unidades Territoriais associadas ao nome indicado
		/// </summary>
		/// <param name="name"></param>
		/// <returns></returns>
		private List<DivisaoTerritorial> CheckDivisoesTerritoriais(string name)
		{
			List<DivisaoTerritorial> divisoes = new List<DivisaoTerritorial>();
			Nomes nome = GetNome(name);
			if (nome == null)
				return divisoes;

			DivisaoTerritorial unidade_divisao = GetUnidadeDivisoesWithName(nome);
			if (unidade_divisao != null)
			{
				// se foi encontrada uma Unidade_Divisão não é necessário pesquisar o nome nas UT nem nas DT
				// pois ambas estão inequivocamente identificadas na Unidade_Divisao
				divisoes.Add(unidade_divisao);
				return divisoes;
			}

			List<int> unidades = GetUnidadesFromNome(nome);
			if (unidades.Count > 0)
				divisoes.AddRange(GetDivisoesFromUnidades(unidades));

			divisoes.AddRange(GetDivisoesFromNome(nome));
			return divisoes;
		}

		/// <summary>
		/// método que retorna a divisao territorial que caracteriza a Unidade_Divisao identificada
		/// pelo nome fornecido.
		/// Se não for encontrada nenhuma Unidade_Divisao com o nome fornecido, retorna null
		/// </summary>
		/// <param name="nome"></param>
		/// <returns></returns>
		private DivisaoTerritorial GetUnidadeDivisoesWithName(Nomes nome)
		{

			return _context.ExecSQL<DivisaoTerritorial>("select ud.DivisoesTerritoriaisId,n.Nome, ud.UnidadesTerritoriaisId, ud.UnidadesDivisoesId, 1 'IsUnidadeDivisao' " +
							"from Unidades_Divisoes ud " +
							"inner join DivisoesTerritoriais dt on ud.DivisoesTerritoriaisId = dt.DivisoesTerritoriaisId " +
							"inner join Nomes n on dt.NomesId = n.NomesId "+
							"where ud.NomesId = " + nome.NomesId).FirstOrDefault();

		}

		/// <summary>
		/// método que retorna uma lista de Divisões Territoriais que tenham o nome fornecido como nome principal ou alternativo
		/// </summary>
		/// <param name="nome"></param>
		/// <returns></returns>
		private List<DivisaoTerritorial> GetDivisoesFromNome(Nomes nome)
		{

			List<DivisaoTerritorial> divisoes = _context.ExecSQL<DivisaoTerritorial>("select dt.DivisoesTerritoriaisId, n.Nome " +
							"from DivisoesTerritoriais dt inner join Nomes n on dt.NomesId = n.NomesId " +
							"where dt.NomesId = " + nome.NomesId);

			List<DivisaoTerritorial> divisoesRange = _context.ExecSQL<DivisaoTerritorial>("select dt.DivisoesTerritoriaisId, n.Nome " +
							"from DT_NomesAlternativos dta " +
							"inner join DivisoesTerritoriais dt on dta.DivisoesTerritoriaisId = dt.DivisoesTerritoriaisId " +
							"inner join Nomes n on dt.NomesId = n.NomesId " +
							"where dta.NomesId = " + nome.NomesId);

			divisoes.AddRange(divisoesRange);
			return divisoes;
		}

		/// <summary>
		/// método que retorna uma lista de todas as Divisões Territoriais que estão associadas a uma Unidade Territorial
		/// </summary>
		/// <param name="unidades">Lista de Unidades Territoriais a consultar</param>
		/// <returns></returns>
		private List<DivisaoTerritorial> GetDivisoesFromUnidades(List<int> unidades)
		{
			List<DivisaoTerritorial> divisoes = new List<DivisaoTerritorial>();
			foreach (int unidade in unidades)
			{

				List<DivisaoTerritorial> divisoesRange = _context.ExecSQL<DivisaoTerritorial>("select ud.DivisoesTerritoriaisId, n.Nome, ud.UnidadesTerritoriaisId, ud.UnidadesDivisoesId " +
							"from Unidades_Divisoes ud " +
							"inner join DivisoesTerritoriais dt on ud.DivisoesTerritoriaisId = dt.DivisoesTerritoriaisId " +
							"inner join Nomes n on dt.NomesId = n.NomesId " +
							"where ud.UnidadesTerritoriaisId = " + unidade);

				divisoes.AddRange(divisoesRange);
			}
			return divisoes;
		}

		/// <summary>
		/// retorna uma lista de Unidades Territoriais que tenham o nome indicado como nome principal ou alternativo
		/// </summary>
		/// <param name="nome"></param>
		/// <returns></returns>
		private List<int> GetUnidadesFromNome(Nomes nome)
		{
			List<int> unidades = _context.UnidadesTerritoriais.Where(ut => ut.NomesId == nome.NomesId).ToList().Select(ut => ut.UnidadesTerritoriaisId).ToList();

			List<int> unidadesRange = _context.UtNomesAlternativos.Where(ut => ut.NomesId == nome.NomesId).ToList().Select(ut => ut.UnidadesTerritoriaisId).ToList();

			unidades.AddRange(unidadesRange);
			return unidades;
		}

		/// <summary>
		/// método que verifica se o nome indicado existe na Knowledged Database
		/// </summary>
		/// <param name="name"></param>
		/// <returns></returns>
		private Nomes GetNome(string name)
		{
			if (name[0].Equals('\''))
				name = name.Substring(1);

			return _context.Nomes.Where(nomes => nomes.Nome == name).SingleOrDefault();
		}

		/// <summary>
		/// método que avalia se a coluna é do tipo Métrica ou Dimensão
		/// </summary>
		private void CheckMetricOrDimension()
		{
			if (this.DifferentTypes.ContainsKey("text"))
			{
				SetAsDimension();
				return;
			}

			if (this.AllDifferent)
			{
				SetAsDimension();
				return;
			}

			if (this.DifferentNumericTypes.ContainsKey("decimal"))
			{
				SetAsMetric();
				return;
			}

			if (this.UniqueValues.Count == 1)
			{
				SetAsDimension();
				return;
			}

			if (checkOrder())
			{
				//The numbers are ordered... Not a metric
				SetAsDimension();
			}
			else
			{
				//The numbers are not ordered... possibly a metric
				SetAsMetric();
			}
		}

		/// <summary>
		/// Verifica se uma lista de números está perfeitamente ordenada, ou seja, se a diferença entre dois números consecutivos é sempre o mesmo
		/// </summary>
		/// <returns></returns>
		private bool checkOrder()
		{
			List<decimal> list = new List<decimal>();
			foreach (KeyValuePair<string, DistinctValue> val in this.UniqueValues)
				list.Add(decimal.Parse(val.Key));

			list.Sort();
			List<decimal> diffs = new List<decimal>();

			for (var i = 0; i < list.Count - 1; i++)
			{
				decimal diff = list[i + 1] - list[i];
				if (diffs.Contains(diff))
					continue;
				else
					diffs.Add(diff);

				if (diffs.Count > 2)
					break;
			}

			if (diffs.Count > 1)
				return false;
			else
				return true;

		}

		/// <summary>
		/// marca a coluna como Dimensão
		/// </summary>
		private void SetAsDimension()
		{
			this.MetricOrDimension = "dimension";
		}

		/// <summary>
		/// marca a coluna como Métrica
		/// </summary>
		private void SetAsMetric()
		{
			this.MetricOrDimension = "metric";
		}

		/// <summary>
		/// método que avalia o tipo de cada um dos valores presentes na coluna
		/// </summary>
		/// <param name="rows"></param>
		private void TypeAnalysis(DataRowCollection rows)
		{
			for (var i = 0; i < rows.Count; i++)
			{
				CsvValue val = new CsvValue(rows[i][this.ColumnName].ToString());
				val.Analyse();
				if (val.IsNull)
				{
					this.NullsCount++;
					continue;
				}

				if (this.DifferentTypes.ContainsKey(val.ValueType))
					this.DifferentTypes[val.ValueType] = this.DifferentTypes[val.ValueType] + 1;
				else
					this.DifferentTypes.Add(val.ValueType, 1);

				if (this.UniqueValues.ContainsKey(val.OriginalValue))
				{
					this.UniqueValues[val.OriginalValue].Count++;
					this.UniqueValues[val.OriginalValue].Rows.Add(i);
				}
				else
					this.UniqueValues.Add(val.OriginalValue, new DistinctValue { Value = val.OriginalValue, Count = 1, Rows = new List<int> { i } });

				if (val.IsNumeric)
				{
					if (this.DifferentNumericTypes.ContainsKey(val.IntegerOrDecimal))
						this.DifferentNumericTypes[val.IntegerOrDecimal] = this.DifferentNumericTypes[val.IntegerOrDecimal] + 1;
					else
						this.DifferentNumericTypes.Add(val.IntegerOrDecimal, 1);
				}
			}

			if (this.UniqueValues.Count == rows.Count && this.NullsCount == 0)
				this.AllDifferent = true;
			else
				this.AllDifferent = false;
		}
	}
}
