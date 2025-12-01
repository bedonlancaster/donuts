using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonutAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryAndSortOrderToHitListItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Category",
                table: "HitListItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SortOrder",
                table: "HitListItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "HitListItems");

            migrationBuilder.DropColumn(
                name: "SortOrder",
                table: "HitListItems");
        }
    }
}
