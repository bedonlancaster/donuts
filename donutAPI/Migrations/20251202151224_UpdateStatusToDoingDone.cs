using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonutAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStatusToDoingDone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update existing Projects: Active(1) -> Doing(1), Completed(2) -> Done(2), Archived(3) -> Done(2)
            migrationBuilder.Sql(@"
                UPDATE ""Projects"" 
                SET ""Status"" = 2 
                WHERE ""Status"" = 3;
            ");

            // Update existing Tracks: Demo(1) -> Doing(1), InProgress(2)/Review(3)/Final(4) -> Done(2)
            migrationBuilder.Sql(@"
                UPDATE ""Tracks"" 
                SET ""Status"" = 2 
                WHERE ""Status"" IN (3, 4);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // No reliable way to reverse this migration as we're consolidating statuses
            // If rolling back, manual data review would be needed
        }
    }
}
