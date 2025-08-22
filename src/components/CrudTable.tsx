import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';

export interface CrudColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface CrudTableProps {
  title: string;
  data: any[];
  columns: CrudColumn[];
  onNew?: () => void;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onBulkEdit?: (items: any[]) => void;
  onBulkDelete?: (items: any[]) => void;
  searchPlaceholder?: string;
  entityFilter?: boolean;
  dateFilter?: boolean;
  statusFilter?: boolean;
  showNewButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showBulkActions?: boolean;
}

export function CrudTable({
  title,
  data,
  columns,
  onNew,
  onView,
  onEdit,
  onDelete,
  onBulkEdit,
  onBulkDelete,
  searchPlaceholder = "Buscar...",
  entityFilter = false,
  dateFilter = false,
  statusFilter = true,
  showNewButton = true,
  showEditButton = true,
  showDeleteButton = true,
  showBulkActions = true
}: CrudTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [entityFilterValue, setEntityFilterValue] = useState('all');
  const [statusFilterValue, setStatusFilterValue] = useState('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter and sort data
  const filteredData = data.filter(item => {
    const matchesSearch = Object.values(item).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesStatus = !statusFilterValue || statusFilterValue === 'all' ||
      (statusFilterValue === 'active' && !item.biIsDeleted) ||
      (statusFilterValue === 'inactive' && item.biIsDeleted);
    
    return matchesSearch && matchesStatus;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedData.length);
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Reset selected items when page changes or filters change
  useEffect(() => {
    setSelectedItems(new Set());
    setSelectAll(false);
  }, [currentPage, searchQuery, statusFilterValue, entityFilterValue]);

  // Adjust current page if it becomes invalid after filtering, but don't reset to 1 unnecessarily
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Update select all state based on current page selections
  useEffect(() => {
    const currentPageIds = paginatedData.map(item => item.id);
    const selectedOnCurrentPage = currentPageIds.filter(id => selectedItems.has(id));
    setSelectAll(currentPageIds.length > 0 && selectedOnCurrentPage.length === currentPageIds.length);
  }, [selectedItems, paginatedData]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set(selectedItems);
    const currentPageIds = paginatedData.map(item => item.id);
    
    if (checked) {
      currentPageIds.forEach(id => newSelected.add(id));
    } else {
      currentPageIds.forEach(id => newSelected.delete(id));
    }
    
    setSelectedItems(newSelected);
    setSelectAll(checked);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const getSelectedItemsData = () => {
    return data.filter(item => selectedItems.has(item.id));
  };

  const handleBulkEdit = () => {
    if (onBulkEdit) {
      onBulkEdit(getSelectedItemsData());
    }
  };

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete(getSelectedItemsData());
      clearSelection();
    }
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize);
    setPageSize(size);
    
    // Adjust current page to maintain roughly the same position
    const currentFirstItem = (currentPage - 1) * pageSize + 1;
    const newPage = Math.ceil(currentFirstItem / size);
    setCurrentPage(Math.max(1, Math.min(newPage, Math.ceil(sortedData.length / size))));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  const renderStatusBadge = (isDeleted: boolean) => (
    <Badge variant={isDeleted ? "destructive" : "default"}>
      {isDeleted ? 'Inactivo' : 'Activo'}
    </Badge>
  );

  const selectedCount = selectedItems.size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">{title}</h1>
        <div className="flex items-center gap-2">
          {onNew && showNewButton && (
            <Button onClick={onNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCount > 0 && showBulkActions && (
        <Card className="bg-accent border-primary">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-accent-foreground">
                  {selectedCount} elemento{selectedCount > 1 ? 's' : ''} seleccionado{selectedCount > 1 ? 's' : ''}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-accent-foreground hover:text-accent-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpiar selección
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {onBulkEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkEdit}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar seleccionados
                  </Button>
                )}
                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar seleccionados
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters - Sin selector de página */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            {statusFilter && (
              <Select value={statusFilterValue} onValueChange={setStatusFilterValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Entity Filter */}
            {entityFilter && (
              <Select value={entityFilterValue} onValueChange={setEntityFilterValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Entidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las entidades</SelectItem>
                  <SelectItem value="1">MINSA</SelectItem>
                  <SelectItem value="2">ESSALUD</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Select All Checkbox */}
                {showBulkActions && (
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos los elementos de esta página"
                    />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={column.sortable ? "cursor-pointer hover:bg-muted/50" : ""}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable && sortColumn === column.key && (
                        sortDirection === 'asc' ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (showBulkActions ? 2 : 1)} className="text-center py-8">
                    <div className="text-muted-foreground">
                      No se encontraron registros
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item, index) => (
                  <TableRow key={item.id || index} className={selectedItems.has(item.id) ? "bg-accent/50" : ""}>
                    {/* Individual Checkbox */}
                    {showBulkActions && (
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => handleSelectItem(item.id)}
                          aria-label={`Seleccionar elemento ${item.id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render 
                          ? column.render(item[column.key], item)
                          : column.key === 'biIsDeleted' 
                            ? renderStatusBadge(item[column.key])
                            : String(item[column.key] || '')
                        }
                      </TableCell>
                    ))}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(item)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver
                            </DropdownMenuItem>
                          )}
                          {onEdit && showEditButton && (
                            <DropdownMenuItem onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          )}

                          {onDelete && showDeleteButton && (
                            <DropdownMenuItem 
                              onClick={() => onDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Table Footer - Controles de paginación mejorados */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Records info and page size selector */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1}–{endIndex} de {sortedData.length} registros
                {selectedCount > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    · {selectedCount} seleccionado{selectedCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Registros por página:</span>
                <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right: Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-8 w-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToLastPage}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}