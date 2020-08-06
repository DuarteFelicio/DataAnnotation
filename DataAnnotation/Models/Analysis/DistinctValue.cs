/*
 * Classe de autoria de Nuno Ribeiro reutilizada.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
    /// <summary>
    /// class that holds a distinct value of a column
    /// holds the information of the value itself, the number of times that occurs and the row indexes where it exists
    /// in case of matching any 'Divisao Territorial', holds a list of them
    /// </summary>
    public class DistinctValue
    {
        public string Value { get; set; }
        public int Count { get; set; }
        public List<int> Rows { get; set; }
        public List<DivisaoTerritorial> Divisoes { get; set; }
    }
}
