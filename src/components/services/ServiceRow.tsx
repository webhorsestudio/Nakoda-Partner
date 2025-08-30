import { WrenchScrewdriverIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Service } from "@/types/services";

interface ServiceRowProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
  onStatusToggle: (id: number) => void;
}

export default function ServiceRow({ 
  service, 
  onEdit, 
  onDelete, 
  onStatusToggle 
}: ServiceRowProps) {
  return (
    <tr key={service.id}>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{service.name}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {service.description || "No description"}
            </div>
          </div>
        </div>
      </td>
      
      <td className="whitespace-nowrap px-6 py-4">
        <button
          onClick={() => onStatusToggle(service.id)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            service.is_active 
              ? 'bg-green-100 text-green-800 border-green-200' 
              : 'bg-red-100 text-red-800 border-red-200'
          }`}
        >
          {service.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        0
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        0
      </td>
      <td className="whitespace-nowrap px-6 py-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-900">0</span>
          <span className="text-yellow-400 ml-1">⭐</span>
        </div>
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex items-center justify-end gap-2">
          <button 
            className="text-blue-600 hover:text-blue-900"
            onClick={() => onEdit(service)}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button 
            className="text-red-600 hover:text-red-900"
            onClick={() => onDelete(service.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
