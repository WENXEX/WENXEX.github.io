#!/usr/bin/env python3
"""
extraer_obj_nombrado.py ─ Extrae vértices y caras con nombres de colección específicos.
"""

import sys
import re
from pathlib import Path
from tkinter import Tk, filedialog, messagebox

def parse_obj(path: Path):
    """Devuelve (vertices, faces, group_names) a partir de un .obj."""
    vertices, faces = [], []
    group_names = []
    current_group = "Objeto_principal"

    with path.open("r", encoding="utf-8", errors="ignore") as fh:
        for line in fh:
            line = line.strip()
            if line.startswith("v "):  # Vértice
                _, x, y, z, *rest = line.split()
                vertices.append((float(x), float(y), float(z)))
                group_names.append(current_group)
            elif line.startswith("f "):  # Cara
                indices = [int(chunk.split('/')[0]) for chunk in line.split()[1:]]
                faces.append(indices)
            elif line.startswith("g "):  # Grupo/nombre de colección
                current_group = line[2:].strip() or f"Grupo_{len(group_names)+1}"
            elif line.startswith("o "):  # Nombre de objeto
                current_group = line[2:].strip() or f"Objeto_{len(group_names)+1}"

    return vertices, faces, group_names

def group_vertices(vertices, group_names):
    """Agrupa vértices por sus nombres de colección."""
    grouped = {}
    for idx, (vertex, group) in enumerate(zip(vertices, group_names), start=1):
        if group not in grouped:
            grouped[group] = []
        grouped[group].append((idx, vertex))
    return grouped

def format_output(vertex_groups, faces) -> str:
    """Formatea la salida con nombres de colección."""
    out_lines = ["# Archivo generado automáticamente\n"]

    # Vértices agrupados por nombre de colección
    for group_name, vertices in vertex_groups.items():
        start_idx = vertices[0][0]
        end_idx = vertices[-1][0]
        
        out_lines.append(f"\n# Colección: {group_name} (Vértices {start_idx}-{end_idx})")
        for global_idx, (x, y, z) in vertices:
            out_lines.append(f"{global_idx} {x:g} {y:g} {z:g}")
        out_lines.append(f"# Fin de {group_name}\n")

    # Caras
    out_lines.append("\nFaces:")
    for face in faces:
        out_lines.append(f"{' '.join(map(str, face))}.")
    out_lines.append("# Fin de caras")

    return "\n".join(out_lines)

def select_file():
    """Abre una ventana para seleccionar el archivo .obj."""
    root = Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(
        title="Seleccionar archivo .obj",
        filetypes=[("OBJ files", "*.obj"), ("All files", "*.*")]
    )
    return Path(file_path) if file_path else None

def get_unique_output_path(obj_path: Path, output_dir: Path) -> Path:
    """Genera una ruta de salida única."""
    obj_name = obj_path.stem
    counter = 0
    while True:
        output_name = f"{obj_name}_estructurado.txt" if counter == 0 else f"{obj_name}_estructurado_{counter}.txt"
        output_path = output_dir / output_name
        if not output_path.exists():
            return output_path
        counter += 1

def main():
    # 1. Seleccionar archivo .obj
    obj_path = select_file()
    if not obj_path:
        messagebox.showerror("Error", "No se seleccionó ningún archivo.")
        return

    # 2. Procesar el archivo
    try:
        vertices, faces, group_names = parse_obj(obj_path)
        vertex_groups = group_vertices(vertices, group_names)
        output_text = format_output(vertex_groups, faces)
    except Exception as e:
        messagebox.showerror("Error", f"Falló al procesar el archivo:\n{e}")
        return

    # 3. Guardar en la ruta especificada
    output_dir = Path(r"C:\Users\Vladimir\Documents\blender\salida")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = get_unique_output_path(obj_path, output_dir)

    try:
        output_path.write_text(output_text, encoding="utf-8")
        messagebox.showinfo("Éxito", f"Resultado guardado en:\n{output_path}")
    except Exception as e:
        messagebox.showerror("Error", f"No se pudo guardar el archivo:\n{e}")

if __name__ == "__main__":
    main()