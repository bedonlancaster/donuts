using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DonutAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddProjectThemeSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ColorTheme",
                table: "Projects");

            migrationBuilder.AddColumn<int>(
                name: "ThemeId",
                table: "Projects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ProjectThemes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Mode = table.Column<int>(type: "integer", nullable: false),
                    Palette = table.Column<int>(type: "integer", nullable: false),
                    PrimaryColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    SecondaryColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    AccentColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    BackgroundColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    TextColor = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: true),
                    EmotionalTone = table.Column<string>(type: "text", nullable: true),
                    VisualDescription = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectThemes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ThemeId",
                table: "Projects",
                column: "ThemeId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_ProjectThemes_ThemeId",
                table: "Projects",
                column: "ThemeId",
                principalTable: "ProjectThemes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Projects_ProjectThemes_ThemeId",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "ProjectThemes");

            migrationBuilder.DropIndex(
                name: "IX_Projects_ThemeId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ThemeId",
                table: "Projects");

            migrationBuilder.AddColumn<string>(
                name: "ColorTheme",
                table: "Projects",
                type: "character varying(7)",
                maxLength: 7,
                nullable: false,
                defaultValue: "");
        }
    }
}
