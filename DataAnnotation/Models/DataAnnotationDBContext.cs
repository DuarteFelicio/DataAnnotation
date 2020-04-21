using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace DataAnnotation.Models
{
    public partial class DataAnnotationDBContext : DbContext
    {
        public DataAnnotationDBContext()
        {
        }

        public DataAnnotationDBContext(DbContextOptions<DataAnnotationDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<CsvColumns> CsvColumns { get; set; }
        public virtual DbSet<CsvFiles> CsvFiles { get; set; }
        public virtual DbSet<CsvValues> CsvValues { get; set; }
        public virtual DbSet<DivisoesTerritoriais> DivisoesTerritoriais { get; set; }
        public virtual DbSet<DtNomesAlternativos> DtNomesAlternativos { get; set; }
        public virtual DbSet<HierarquiasTerritoriais> HierarquiasTerritoriais { get; set; }
        public virtual DbSet<HtNomesAlternativos> HtNomesAlternativos { get; set; }
        public virtual DbSet<Nodes> Nodes { get; set; }
        public virtual DbSet<Nomes> Nomes { get; set; }
        public virtual DbSet<RowTrees> RowTrees { get; set; }
        public virtual DbSet<UnidadesDivisoes> UnidadesDivisoes { get; set; }
        public virtual DbSet<UnidadesDivisoesHierarquias> UnidadesDivisoesHierarquias { get; set; }
        public virtual DbSet<UnidadesTerritoriais> UnidadesTerritoriais { get; set; }
        public virtual DbSet<UtNomesAlternativos> UtNomesAlternativos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CsvColumns>(entity =>
            {
                entity.HasIndex(e => e.CsvFilesId)
                    .HasName("IX_CsvColumns_1");

                entity.Property(e => e.ColumnName)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.MetricOrDimension)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(d => d.CsvFiles)
                    .WithMany(p => p.CsvColumns)
                    .HasForeignKey(d => d.CsvFilesId);
            });

            modelBuilder.Entity<CsvFiles>(entity =>
            {
                entity.Property(e => e.FileNameDisplay)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.FileNameStorage)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(e => e.Origin)
                    .IsRequired()
                    .HasMaxLength(500);
            });

            modelBuilder.Entity<CsvValues>(entity =>
            {
                entity.HasIndex(e => e.CsvColumnsId)
                    .HasName("IX_CsvValues_1");

                entity.Property(e => e.IntegerOrDecimal).HasMaxLength(50);

                entity.Property(e => e.NumericValue).HasColumnType("decimal(18, 2)");

                entity.Property(e => e.OriginalValue)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.HasOne(d => d.CsvColumns)
                    .WithMany(p => p.CsvValues)
                    .HasForeignKey(d => d.CsvColumnsId);
            });

            modelBuilder.Entity<DivisoesTerritoriais>(entity =>
            {
                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_DivisoesTerritoriais_1");

                entity.HasIndex(e => e.UnidadesTerritoriaisId)
                    .HasName("IX_DivisoesTerritoriais_2");

                entity.Property(e => e.Descricao)
                    .IsRequired()
                    .HasMaxLength(4000)
                    .IsUnicode(false);

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.DivisoesTerritoriais)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_DivisoesTerritoriais_Nomes");

                entity.HasOne(d => d.UnidadesTerritoriais)
                    .WithMany(p => p.DivisoesTerritoriais)
                    .HasForeignKey(d => d.UnidadesTerritoriaisId)
                    .HasConstraintName("FK_DivisoesTerritoriais_UnidadesTerritoriais");
            });

            modelBuilder.Entity<DtNomesAlternativos>(entity =>
            {
                entity.HasKey(e => new { e.DivisoesTerritoriaisId, e.NomesId });

                entity.ToTable("DT_NomesAlternativos");

                entity.HasIndex(e => e.DivisoesTerritoriaisId)
                    .HasName("IX_DT_NomesAlternativos_1");

                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_DT_NomesAlternativos_2");

                entity.HasOne(d => d.DivisoesTerritoriais)
                    .WithMany(p => p.DtNomesAlternativos)
                    .HasForeignKey(d => d.DivisoesTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_DT_NomesAlternativos_DivisoesTerritoriais");

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.DtNomesAlternativos)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_DT_NomesAlternativos_Nomes");
            });

            modelBuilder.Entity<HierarquiasTerritoriais>(entity =>
            {
                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_HierarquiasTerritoriais_1");

                entity.Property(e => e.Descricao)
                    .IsRequired()
                    .HasMaxLength(4000)
                    .IsUnicode(false);

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.HierarquiasTerritoriais)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_HierarquiasTerritoriais_Nomes");
            });

            modelBuilder.Entity<HtNomesAlternativos>(entity =>
            {
                entity.HasKey(e => new { e.HierarquiasTerritoriaisId, e.NomesId });

                entity.ToTable("HT_NomesAlternativos");

                entity.HasIndex(e => e.HierarquiasTerritoriaisId)
                    .HasName("IX_HT_NomesAlternativos_1");

                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_HT_NomesAlternativos_2");

                entity.HasOne(d => d.HierarquiasTerritoriais)
                    .WithMany(p => p.HtNomesAlternativos)
                    .HasForeignKey(d => d.HierarquiasTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_HT_NomesAlternativos_HierarquiasTerritoriais");

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.HtNomesAlternativos)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_HT_NomesAlternativos_Nomes");
            });

            modelBuilder.Entity<Nodes>(entity =>
            {
                entity.HasIndex(e => e.ParentId)
                    .HasName("IX_Nodes_2");

                entity.HasIndex(e => e.RowTreesId)
                    .HasName("IX_Nodes_1");

                entity.Property(e => e.Value).IsRequired();

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.InverseParent)
                    .HasForeignKey(d => d.ParentId)
                    .HasConstraintName("FK_Nodes_Parent");

                entity.HasOne(d => d.RowTrees)
                    .WithMany(p => p.Nodes)
                    .HasForeignKey(d => d.RowTreesId);
            });

            modelBuilder.Entity<Nomes>(entity =>
            {
                entity.HasIndex(e => new { e.Nome, e.Idioma })
                    .HasName("UIX_Nomes_1")
                    .IsUnique();

                entity.Property(e => e.Idioma)
                    .IsRequired()
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.Nome)
                    .IsRequired()
                    .HasMaxLength(500)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<RowTrees>(entity =>
            {
                entity.HasIndex(e => e.CsvColumnsId)
                    .HasName("IX_RowTrees_1");

                entity.HasOne(d => d.CsvColumns)
                    .WithMany(p => p.RowTrees)
                    .HasForeignKey(d => d.CsvColumnsId);
            });

            modelBuilder.Entity<UnidadesDivisoes>(entity =>
            {
                entity.ToTable("Unidades_Divisoes");

                entity.HasIndex(e => e.DivisoesTerritoriaisId)
                    .HasName("IX_Unidades_Divisoes_1");

                entity.HasIndex(e => e.NomesId)
                    .HasName("UIX_Unidades_Divisoes_2")
                    .IsUnique()
                    .HasFilter("([NomesId] IS NOT NULL)");

                entity.HasIndex(e => new { e.UnidadesTerritoriaisId, e.DivisoesTerritoriaisId })
                    .HasName("UIX_Unidades_Divisoes_1")
                    .IsUnique();

                entity.HasOne(d => d.DivisoesTerritoriais)
                    .WithMany(p => p.UnidadesDivisoes)
                    .HasForeignKey(d => d.DivisoesTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Unidades_Divisoes_DivisoesTerritoriais");

                entity.HasOne(d => d.Nomes)
                    .WithOne(p => p.UnidadesDivisoes)
                    .HasForeignKey<UnidadesDivisoes>(d => d.NomesId)
                    .HasConstraintName("FK_Unidades_Divisoes_Nomes");

                entity.HasOne(d => d.UnidadesTerritoriais)
                    .WithMany(p => p.UnidadesDivisoes)
                    .HasForeignKey(d => d.UnidadesTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Unidades_Divisoes_UnidadesTerritoriais");
            });

            modelBuilder.Entity<UnidadesDivisoesHierarquias>(entity =>
            {
                entity.ToTable("Unidades_Divisoes_Hierarquias");

                entity.HasIndex(e => e.ParentId)
                    .HasName("IX_Unidades_Divisoes_Hierarquias_2");

                entity.HasIndex(e => e.UnidadesDivisoesId)
                    .HasName("IX_Unidades_Divisoes_Hierarquias_1");

                entity.HasIndex(e => new { e.HierarquiasTerritoriaisId, e.UnidadesDivisoesId })
                    .HasName("UIX_Unidades_Divisoes_Hierarquias_1")
                    .IsUnique();

                entity.HasOne(d => d.HierarquiasTerritoriais)
                    .WithMany(p => p.UnidadesDivisoesHierarquias)
                    .HasForeignKey(d => d.HierarquiasTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Unidades_Divisoes_Hierarquias_HierarquiasTerritoriais");

                entity.HasOne(d => d.Parent)
                    .WithMany(p => p.UnidadesDivisoesHierarquiasParent)
                    .HasForeignKey(d => d.ParentId)
                    .HasConstraintName("FK_Unidades_Divisoes_Hierarquias_Unidades_Divisoes_Parent");

                entity.HasOne(d => d.UnidadesDivisoes)
                    .WithMany(p => p.UnidadesDivisoesHierarquiasUnidadesDivisoes)
                    .HasForeignKey(d => d.UnidadesDivisoesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_Unidades_Divisoes_Hierarquias_Unidades_Divisoes");
            });

            modelBuilder.Entity<UnidadesTerritoriais>(entity =>
            {
                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_UnidadesTerritoriais_1");

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.UnidadesTerritoriais)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_UnidadesTerritoriais_Nomes");
            });

            modelBuilder.Entity<UtNomesAlternativos>(entity =>
            {
                entity.HasKey(e => new { e.UnidadesTerritoriaisId, e.NomesId });

                entity.ToTable("UT_NomesAlternativos");

                entity.HasIndex(e => e.NomesId)
                    .HasName("IX_UT_NomesAlternativos_2");

                entity.HasIndex(e => e.UnidadesTerritoriaisId)
                    .HasName("IX_UT_NomesAlternativos_1");

                entity.HasOne(d => d.Nomes)
                    .WithMany(p => p.UtNomesAlternativos)
                    .HasForeignKey(d => d.NomesId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_UT_NomesAlternativos_Nomes");

                entity.HasOne(d => d.UnidadesTerritoriais)
                    .WithMany(p => p.UtNomesAlternativos)
                    .HasForeignKey(d => d.UnidadesTerritoriaisId)
                    .OnDelete(DeleteBehavior.ClientSetNull)
                    .HasConstraintName("FK_UT_NomesAlternativos_UnidadesTerritoriais");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
