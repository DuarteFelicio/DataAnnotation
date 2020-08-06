/*
 * Classe de autoria de Nuno Ribeiro reutilizada.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAnnotation.Models.Analysis
{
    
    public class Tree
    {
        public int RowTreesId { get; set; }
        public int CsvColumnsId { get; set; }
        public bool Validated { get; set; }

        
        public List<Node> RootNodes { get; set; }


        public void AddRoot(Node n)
        {
            if (this.RootNodes == null)
                this.RootNodes = new List<Node>();

            this.RootNodes.Add(n);
        }

        public Node GetRootNode(string id)
        {
            if (this.RootNodes == null || this.RootNodes.Count == 0)
                return null;

            return this.RootNodes.Find(x => x.Id.Equals(id));
        }

        public Tree ProduceCleanTree()
        {
            Tree newTree = new Tree
            {
                CsvColumnsId = this.CsvColumnsId,
                RootNodes = new List<Node>()
            };

            foreach (Node node in this.RootNodes)
                AddNodeToTree(node, newTree.RootNodes, null);

            return newTree;
        }

        public List<ColumnNode> ProduceCleanColumnTree2()
        {
            List<ColumnNode> nodes = new List<ColumnNode>();
            foreach (Node node in this.RootNodes)
                AddNodeToTreeColumn2(node, nodes);

            return nodes;
        }

        public void AddNodeToTreeColumn2(Node node, List<ColumnNode> place)
        {
            ColumnNode newNode = new ColumnNode(node);
            place.Add(newNode);
            foreach (Node child in node.Children)
                AddNodeToTreeColumn2(child, newNode.nodes);
        }

        public List<ColumnNode> ProduceCleanColumnTree()
        {
            List<ColumnNode> nodes = new List<ColumnNode>();
            foreach (Node node in this.RootNodes)
                AddNodeToTreeColumn(node, nodes);

            return nodes;
        }

        public void AddNodeToTreeColumn(Node node, List<ColumnNode> place)
        {
            if (node.HasValue || node.Children.Count > 1)
            {
                ColumnNode newNode = new ColumnNode(node);
                //newNode.ParentNode = parentNode;
                place.Add(newNode);
                foreach (Node child in node.Children)
                    AddNodeToTreeColumn(child, newNode.nodes);
            }
            else
                foreach (Node child in node.Children)
                    AddNodeToTreeColumn(child, place);
        }

        public void AddNodeToTree(Node node, List<Node> place, Node parentNode)
        {
            if (node.HasValue || node.Children.Count > 1)
            {
                Node newNode = node.CopyNode();
                //newNode.ParentNode = parentNode;
                place.Add(newNode);
                foreach (Node child in node.Children)
                    AddNodeToTree(child, newNode.Children, newNode);
            }
            else
                foreach (Node child in node.Children)
                    AddNodeToTree(child, place, parentNode);
        }

        /*public void SaveTree(PetaPoco.Database db)
        {
            db.Insert(this);

            foreach (Node n in this.RootNodes)
                SaveNode(n, null, db);
        }

        private void SaveNode(Node node, int? parentId, PetaPoco.Database db)
        {
            node.SaveNode(parentId, this.RowTreesId, db);

            foreach (Node n in node.Children)
                n.SaveNode(node.NodesId, this.RowTreesId, db);
        }*/
    }
}
