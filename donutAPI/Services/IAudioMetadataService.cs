namespace DonutAPI.Services
{
    public interface IAudioMetadataService
    {
        /// <summary>
        /// Extracts the duration from an audio file
        /// </summary>
        /// <param name="filePath">Full path to the audio file</param>
        /// <returns>Duration as TimeSpan, or null if unable to extract</returns>
        TimeSpan? ExtractDuration(string filePath);
    }
}
