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
    /// classe que representa um valor de uma coluna
    /// </summary>
    public class CsvValue
    {
        public int CsvValuesId { get; set; }
        public int CsvColumnsId { get; set; }
        public string OriginalValue { get; set; }
        public bool IsNull { get; set; }
        public bool IsText { get; set; }
        public bool IsNumeric { get; set; }
        public decimal? NumericValue { get; set; }
        public string IntegerOrDecimal { get; set; }
        public string ValueType { get; set; }

        public CsvValue(string value)
        {
            this.OriginalValue = value;
            this.NumericValue = null;
            this.IntegerOrDecimal = null;
        }

        /// <summary>
        /// analise o valor e marca-o como null, textual ou numérico
        /// </summary>
        public void Analyse()
        {
            CheckIfNull();
            if (this.IsNull)
                return;

            CheckNumericOrText();
        }

        /// <summary>
        /// avalia e marca o valor como textual ou numérico
        /// </summary>
        private void CheckNumericOrText()
        {
            string val = this.OriginalValue;
            if (val.IndexOf(".") > -1)
                val = val.Replace('.', ',');
            if (decimal.TryParse(val, out decimal result))
            {
                this.IsNumeric = true;
                this.IsText = false;
                this.NumericValue = result;
                this.ValueType = "numeric";

                if (Int32.TryParse(this.OriginalValue, out int resultInt))
                    this.IntegerOrDecimal = "integer";
                else
                    this.IntegerOrDecimal = "decimal";
            }
            else
            {
                this.IsNumeric = false;
                this.IsText = true;
                this.ValueType = "text";
            }
        }

        /// <summary>
        /// avalia e marca o valor como null ou não
        /// </summary>
        private void CheckIfNull()
        {
            switch (this.OriginalValue.Trim())
            {
                case null:
                case "null":
                case "":
                case ":":
                case "N/A":
                case "n/a": SetNull(); break;
                default: this.IsNull = false; break;
            }
        }

        /// <summary>
        /// marca o valor como null
        /// </summary>
        private void SetNull()
        {
            this.IsNull = true;
            this.IsNumeric = false;
            this.IsText = false;
            this.ValueType = "null";
        }
    }
}
