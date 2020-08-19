using System;
using System.Collections.Generic;
using System.Data;
using System.Reflection;
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

        public virtual DbSet<ActionRecord> ActionRecord { get; set; }
        public virtual DbSet<AspNetUsers> AspNetUsers { get; set; }
        public virtual DbSet<CsvFile> CsvFile { get; set; }
        public virtual DbSet<DivisoesTerritoriais> DivisoesTerritoriais { get; set; }
        public virtual DbSet<DtNomesAlternativos> DtNomesAlternativos { get; set; }
        public virtual DbSet<HierarquiasTerritoriais> HierarquiasTerritoriais { get; set; }
        public virtual DbSet<HtNomesAlternativos> HtNomesAlternativos { get; set; }
        public virtual DbSet<LoginRecord> LoginRecord { get; set; }
        public virtual DbSet<Nomes> Nomes { get; set; }
        public virtual DbSet<UnidadesDivisoes> UnidadesDivisoes { get; set; }
        public virtual DbSet<UnidadesDivisoesHierarquias> UnidadesDivisoesHierarquias { get; set; }
        public virtual DbSet<UnidadesTerritoriais> UnidadesTerritoriais { get; set; }
        public virtual DbSet<UtNomesAlternativos> UtNomesAlternativos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ActionRecord>(entity =>
            {
                entity.Property(e => e.Action)
                    .IsRequired()
                    .HasMaxLength(8);

                entity.Property(e => e.Version)
                    .IsRequired()
                    .HasMaxLength(12);

                entity.HasOne(d => d.CsvFile)
                    .WithMany(p => p.ActionRecord)
                    .HasForeignKey(d => d.CsvFileId)
                    .HasConstraintName("FK_ActionRecord_CsvFile_Id");
            });

            modelBuilder.Entity<AspNetUsers>(entity =>
            {
                entity.HasIndex(e => e.NormalizedEmail)
                    .HasName("EmailIndex");

                entity.HasIndex(e => e.NormalizedUserName)
                    .HasName("UserNameIndex")
                    .IsUnique()
                    .HasFilter("([NormalizedUserName] IS NOT NULL)");

                entity.Property(e => e.Email).HasMaxLength(256);

                entity.Property(e => e.NormalizedEmail).HasMaxLength(256);

                entity.Property(e => e.NormalizedUserName).HasMaxLength(256);

                entity.Property(e => e.UserName).HasMaxLength(256);
            });

            modelBuilder.Entity<CsvFile>(entity =>
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

                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasMaxLength(450);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.CsvFile)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK_CsvFile_AspNetUsers_Id");
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

            modelBuilder.Entity<LoginRecord>(entity =>
            {
                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasMaxLength(450);

                entity.HasOne(d => d.User)
                    .WithMany(p => p.LoginRecord)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK_LoginRecord_AspNetUsers_Id");
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

        public List<T> ExecSQL<T>(string query)
        {
            using (var command = Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = query;
                command.CommandType = CommandType.Text;
                Database.OpenConnection();

                List<T> list = new List<T>();
                using (var result = command.ExecuteReader())
                {
                    T obj = default(T);
                    while (result.Read())
                    {
                        obj = Activator.CreateInstance<T>();
                        foreach (PropertyInfo prop in obj.GetType().GetProperties())
                        {
                            try
                            {
                                if (!object.Equals(result[prop.Name], DBNull.Value))
                                {
                                    prop.SetValue(obj, result[prop.Name], null);
                                }
                            }
                            catch (IndexOutOfRangeException e)
                            {
                                break;
                            }
                        }
                        list.Add(obj);
                    }
                }
                Database.CloseConnection();
                return list;
            }
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
