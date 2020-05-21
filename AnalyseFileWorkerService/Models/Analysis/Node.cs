using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
    /// <summary>
    /// classe que representa um nó da árvore Radix Tree
    /// </summary>
    public class Node
    {
        public int NodesId { get; set; }
        public int RowTreesId { get; set; }
        public int? ParentId { get; set; }
        public int? RowIndex { get; set; }
        public string Value { get; set; }


        public bool HasValue { get; set; }
        public string Id { get; set; }
        public Node ParentNode { get; set; }
        public List<Node> Children { get; set; }

        public Node CopyNode()
        {
            Node node = new Node();
            node.Id = this.Id;
            node.RowIndex = this.RowIndex;
            node.HasValue = this.HasValue;
            node.Value = this.Value;
            node.Children = new List<Node>();
            return node;
        }

        public Node FindChild(string id)
        {
            if (this.Children == null || this.Children.Count == 0)
                return null;

            return this.Children.Find(x => x.Id.Equals(id));
        }

        public void AddChild(Node n)
        {
            if (this.Children == null || this.Children.Count == 0)
                this.Children = new List<Node>();

            this.Children.Add(n);
        }

        public void SaveNode(int? parentId, int rowTreesId) // ,PetaPoco.Database db)
        {
            this.ParentId = parentId;
            this.RowTreesId = rowTreesId;
            //db.Insert(this);
        }
    }

    public class ColumnNode
    {
        public int id { get; set; }
        public string title { get; set; }
        public bool hasValue { get; set; }
        public List<ColumnNode> nodes { get; set; }
        public int FirstValue { get; set; }

        public ColumnNode(Node n)
        {
            this.id = n.RowIndex.Value;
            this.title = n.Id;
            this.hasValue = n.HasValue;
            this.nodes = new List<ColumnNode>();
        }

        public ColumnNode(ColumnNode n)
        {
            this.id = n.id;
            this.title = n.title;
            this.hasValue = n.hasValue;
            this.FirstValue = n.FirstValue;
            this.nodes = new List<ColumnNode>();
        }
    }
}
