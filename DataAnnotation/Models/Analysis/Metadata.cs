using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{

    /// <summary>
    /// classe que representa o ficheiro de Meta-Informação correspondente ao ficheiro de dados analisado
    /// </summary>
    public class Metadata
    {
        public string Nome { get; set; }
        public int NumLinhas { get; set; }
        public int NumColunas { get; set; }
        public DateTime DataGeracao { get; set; }
        public List<MD_Divisao> GeoDivisoes { get; set; }
        public List<MD_Dimensao> Dimensoes { get; set; }
        public MD_Metricas Metricas { get; set; }

        public Metadata(CsvFile file,CsvFileEx fileEx, DateTime timeInit, DataAnnotationDBContext _context)
        {
            Nome = file.FileNameDisplay;
            NumLinhas = file.RowsCount.Value;
            NumColunas = file.ColumnsCount.Value;
            DataGeracao = DateTime.Now;
            GenerateGeoDivisoesList(fileEx.RowGeographic);
            GenerateDimensionsList(fileEx.Columns);
            GenerateMetrics(fileEx);
            file.AnalysisDuration = DateTime.Now.Subtract(timeInit);
            file.AnalysisCompletionTime = DateTime.Now;
            _context.CsvFile.Update(file);
            _context.SaveChanges();
        }

        private void GenerateMetrics(CsvFileEx file)
        {
            this.Metricas = new MD_Metricas();
            AddMetrics(file.RootCategory.columnMetrics, null);
            int index = 1;
            foreach (Categoria cat in file.RootCategory.categoriasfilhas)
                AddCategory(cat, ref index, null);
        }

        private void AddMetrics(List<CatMetrics> metrics, int? categoryId)
        {
            foreach (CatMetrics metric in metrics)
                AddMetric(metric, categoryId, false);
        }

        private void AddMetric(CatMetrics metric, int? categoryId, bool isTotal)
        {
            this.Metricas.Colunas.Add(new MD_Coluna(metric, categoryId, isTotal));
        }

        private void AddCategory(Categoria category, ref int index, int? parentId)
        {
            MD_Categoria cat = new MD_Categoria(category, index, parentId);
            if (category.columnMetrics != null && category.columnMetrics.Count > 0)
                AddMetrics(category.columnMetrics, cat.CategoriaId);

            if (category.CatValue != null)
                AddMetric(new CatMetrics { ColumnName = category.CatValue, ColumnIndex = category.CatValueId }, cat.CategoriaId, true);

            this.Metricas.Categorias.Add(cat);
            foreach (Categoria child in category.categoriasfilhas)
            {
                index++;
                AddCategory(child, ref index, cat.CategoriaId);
            }
        }

        private void GenerateDimensionsList(List<CsvColumn> columns)
        {
            this.Dimensoes = new List<MD_Dimensao>();
            foreach (CsvColumn column in columns)
                if (column.MetricOrDimension.Equals("dimension"))
                    this.Dimensoes.Add(new MD_Dimensao(column));
        }

        private void GenerateGeoDivisoesList(List<DivisaoTerritorial>[] rows)
        {
            this.GeoDivisoes = new List<MD_Divisao>();

            for (int row = 0; row < rows.Length; row++)
            {
                if (rows[row] == null)
                    continue;
                foreach (DivisaoTerritorial divisao in rows[row])
                {
                    MD_Divisao mddivisao = GetMDDivisao(divisao);
                    mddivisao.Linhas.Add(row);
                }
            }
        }

        private MD_Divisao GetMDDivisao(DivisaoTerritorial dt)
        {
            MD_Divisao divisao = this.GeoDivisoes.Find(x => x.DivisoesTerritoriaisId == dt.DivisoesTerritoriaisId);
            if (divisao == null)
            {
                divisao = new MD_Divisao(dt);
                this.GeoDivisoes.Add(divisao);
            }
            return divisao;
        }
    }



    public class MD_Divisao
    {
        public int? DivisoesTerritoriaisId { get; set; }
        public string Tipo { get; set; }
        public List<int> Linhas { get; set; }

        public MD_Divisao() { }
        public MD_Divisao(DivisaoTerritorial dt)
        {
            this.DivisoesTerritoriaisId = dt.DivisoesTerritoriaisId;
            this.Tipo = dt.Nome;
            this.Linhas = new List<int>();
        }
    }

    public class MD_Dimensao
    {
        public int IndiceColuna { get; set; }
        public string NomeColuna { get; set; }
        public int NumValoresUnicos { get; set; }
        public int NumValoresNulos { get; set; }
        public bool TodosDiferentes { get; set; }
        public List<MD_TipoValor> TipoValores { get; set; }
        public List<string> ValoresUnicos { get; set; }
        public string TipoDominioGeo { get; set; }

        public MD_Dimensao() { }

        public MD_Dimensao(CsvColumn column)
        {
            this.IndiceColuna = column.ColumnIndex;
            this.NomeColuna = column.ColumnName;
            this.NumValoresUnicos = column.CountUniqueValues;
            this.NumValoresNulos = column.NullsCount;
            this.TodosDiferentes = column.AllDifferent;

            this.TipoValores = new List<MD_TipoValor>();
            foreach (KeyValuePair<string, int> pair in column.DifferentTypes)
                this.TipoValores.Add(new MD_TipoValor { Tipo = pair.Key, Count = pair.Value });

            this.ValoresUnicos = new List<string>();
            if (column.UniqueValues != null && column.UniqueValues.Count > 0)
                foreach (KeyValuePair<string, DistinctValue> pair in column.UniqueValues)
                    this.ValoresUnicos.Add(pair.Key);

            if (column.Geographic != null)
            {
                if (column.Geographic.Unidades != null && column.Geographic.Unidades.Count > 0)
                    this.TipoDominioGeo = "Unidades Territoriais";
                else
                    if (column.Geographic.Divisoes != null && column.Geographic.Divisoes.Count > 0)
                    this.TipoDominioGeo = "Divisoes Territoriais";
            }
        }
    }

    public class MD_TipoValor
    {
        public string Tipo { get; set; }
        public int Count { get; set; }
    }

    public class MD_Metricas
    {
        public List<MD_Categoria> Categorias { get; set; }
        public List<MD_Coluna> Colunas { get; set; }

        public MD_Metricas()
        {
            this.Categorias = new List<MD_Categoria>();
            this.Colunas = new List<MD_Coluna>();
        }
    }

    public class MD_Categoria
    {
        public int CategoriaId { get; set; }
        public string Nome { get; set; }
        public int? CategoriaPaiId { get; set; }

        public MD_Categoria() { }

        public MD_Categoria(Categoria categoria, int index, int? parentId)
        {
            this.CategoriaId = index;
            this.Nome = categoria.nome;
            this.CategoriaPaiId = parentId;
        }
    }

    public class MD_Coluna
    {
        public int IndiceColuna { get; set; }
        public string NomeColuna { get; set; }
        public int? CategoriaId { get; set; }
        public bool E_Total { get; set; }

        public MD_Coluna() { }

        public MD_Coluna(CatMetrics metric, int? categoriaId, bool isTotal)
        {
            this.IndiceColuna = metric.ColumnIndex;
            this.NomeColuna = metric.ColumnName;
            this.CategoriaId = categoriaId;
            this.E_Total = isTotal;
        }
    }
}
