using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DonutAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddTrackVersioning : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Rename column first (preserves data)
            migrationBuilder.RenameColumn(
                name: "UploadedById",
                table: "Tracks",
                newName: "CreatedById");

            migrationBuilder.RenameIndex(
                name: "IX_Tracks_UploadedById",
                table: "Tracks",
                newName: "IX_Tracks_CreatedById");

            // Step 2: Add CreatedAt column with default value
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Tracks",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()");

            // Step 3: Create TrackVersions table
            migrationBuilder.CreateTable(
                name: "TrackVersions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TrackId = table.Column<int>(type: "integer", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    FileUrl = table.Column<string>(type: "text", nullable: false),
                    FileType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Duration = table.Column<TimeSpan>(type: "interval", nullable: true),
                    UploadedById = table.Column<int>(type: "integer", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsCurrentVersion = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrackVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TrackVersions_AspNetUsers_UploadedById",
                        column: x => x.UploadedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TrackVersions_Tracks_TrackId",
                        column: x => x.TrackId,
                        principalTable: "Tracks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            // Step 4: Migrate existing track file data to TrackVersion table (version 1)
            // Only migrate tracks that have file data
            migrationBuilder.Sql(@"
                INSERT INTO ""TrackVersions"" 
                    (""TrackId"", ""VersionNumber"", ""FileUrl"", ""FileType"", ""Duration"", 
                     ""UploadedById"", ""UploadedAt"", ""IsCurrentVersion"", ""Notes"")
                SELECT 
                    ""Id"" as ""TrackId"",
                    1 as ""VersionNumber"",
                    ""FileUrl"",
                    COALESCE(""FileType"", 'mp3') as ""FileType"",
                    ""Duration"",
                    ""CreatedById"" as ""UploadedById"",
                    ""CreatedAt"" as ""UploadedAt"",
                    true as ""IsCurrentVersion"",
                    'Migrated from original track' as ""Notes""
                FROM ""Tracks""
                WHERE ""FileUrl"" IS NOT NULL;
            ");

            // Step 5: Now safe to drop old columns from Tracks table
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "FileType",
                table: "Tracks");

            migrationBuilder.DropColumn(
                name: "FileUrl",
                table: "Tracks");

            // Step 6: Create indices
            migrationBuilder.CreateIndex(
                name: "IX_TrackVersions_TrackId_IsCurrentVersion",
                table: "TrackVersions",
                columns: new[] { "TrackId", "IsCurrentVersion" },
                filter: "\"IsCurrentVersion\" = true");

            migrationBuilder.CreateIndex(
                name: "IX_TrackVersions_TrackId_VersionNumber",
                table: "TrackVersions",
                columns: new[] { "TrackId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TrackVersions_UploadedById",
                table: "TrackVersions",
                column: "UploadedById");

            // Step 7: Update foreign key
            migrationBuilder.DropForeignKey(
                name: "FK_Tracks_AspNetUsers_UploadedById",
                table: "Tracks");

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_AspNetUsers_CreatedById",
                table: "Tracks",
                column: "CreatedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tracks_AspNetUsers_CreatedById",
                table: "Tracks");

            migrationBuilder.DropTable(
                name: "TrackVersions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Tracks");

            migrationBuilder.RenameColumn(
                name: "CreatedById",
                table: "Tracks",
                newName: "UploadedById");

            migrationBuilder.RenameIndex(
                name: "IX_Tracks_CreatedById",
                table: "Tracks",
                newName: "IX_Tracks_UploadedById");

            migrationBuilder.AddColumn<TimeSpan>(
                name: "Duration",
                table: "Tracks",
                type: "interval",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileType",
                table: "Tracks",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileUrl",
                table: "Tracks",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_AspNetUsers_UploadedById",
                table: "Tracks",
                column: "UploadedById",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
