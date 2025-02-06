import React from 'react';
import {
  Table,
  TableCell,
  TableHeader,
} from '../../../../components/CustomTable';

export default function TablaLoading() {
  return (
    <Table>
      <TableHeader borderColor="#eee">
        <TableCell text="Número" color="gray" />
      </TableHeader>
    </Table>
  );
}
