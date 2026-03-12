namespace TaskManager.API.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    }
}