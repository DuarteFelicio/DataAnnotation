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

        public virtual DbSet<FileNames> FileNames { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<FileNames>(entity =>
            {

                entity.ToTable("file_names");

                entity.Property(e => e.Id)
                    .HasColumnName("id");

                entity.Property(e => e.FileNameDisplay)
                    .HasColumnName("fileNameDisplay")
                    .HasMaxLength(256)
                    .IsUnicode(false);

                entity.Property(e => e.FileNameStorage)
                    .HasColumnName("fileNameStorage")
                    .HasMaxLength(256)
                    .IsUnicode(false);

                entity.Property(e => e.UserId)
                    .HasColumnName("userId")
                    .HasMaxLength(450);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
