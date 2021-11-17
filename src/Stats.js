export function write_csv(data) {
    console.log(data);
    let csvContent =
        "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.style.display = "none";
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "game_data.csv");
    document.body.appendChild(link);

    link.click();
}
