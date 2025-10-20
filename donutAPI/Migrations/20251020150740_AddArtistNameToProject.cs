using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonutAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddArtistNameToProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArtistName",
                table: "Projects",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ArtistName",
                table: "Projects");
        }
    }
}
