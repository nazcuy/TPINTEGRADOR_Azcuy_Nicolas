import type { Categoria } from '../types/categoria';

interface Props {
  categoria: Categoria;
  onEdit: (categoria: Categoria) => void;
  onDelete: (id: number) => void;
}

export const CategoriaCard = ({ categoria, onEdit, onDelete }: Props) => {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3 text-gray-600">{categoria.id}</td>
      <td className="p-3 font-medium text-gray-800">{categoria.nombre}</td>
      <td className="p-3 text-gray-500">{categoria.descripcion ?? 'â€”'}</td>
      <td className="p-3 text-right space-x-3">
        <button
          onClick={() => onEdit(categoria)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          Editar
        </button>
        <button
          onClick={() => onDelete(categoria.id)}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Eliminar
        </button>
      </td>
    </tr>
  );
};


