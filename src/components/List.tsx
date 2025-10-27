import { useState } from 'react';
import { Input } from './Input'; // Ensure to adjust the path as necessary
import { Select } from './Select'; // Adjust the path as necessary
import { Box } from './Box'; // Adjust the path as necessary
import { Flex } from './Flex';

type ListProps = {
  label?: string;
};

export const List = ({ label }: ListProps) => {
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');
  const [selectedItem, setSelectedItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems(prev => [...prev, newItem.trim()]);
      setNewItem('');
    }
  };

  const options = items.map(item => ({ value: item, label: item }));

  return (
    <Box className="min-h-min">
      <Flex>
        <div className="flex flex-col w-full">
          {label && <h2 className="text-lg font-bold mb-4">{label}</h2>}
          {/* <Input
          label="New Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addItem();
            }}
            />
            <button
            onClick={addItem}
            className="mt-2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
            Add
            </button>
            <Select
            label="Select Item"
            options={options}
            value={selectedItem}
            onChange={setSelectedItem}
            placeholder="Select an item"
            />
            <ul className="mt-4">
            {items.map((item, index) => (
              <li key={index} className="py-1 text-gray-700">
              {item}
              </li>
              ))}
              </ul> */}
        </div>
      </Flex>
    </Box>
  );
};

List.displayName = 'List';
