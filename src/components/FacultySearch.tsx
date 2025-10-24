import React, { useState, useMemo } from 'react';
import { Input } from './ui/input';
import { 
  Search
} from 'lucide-react';
import type { FacultyMember } from '../App';
import { SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';

interface FacultySearchProps {
  faculty: FacultyMember[];
}

export function FacultySearch({ faculty }: FacultySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter faculty based on search criteria
  const filteredFaculty = useMemo(() => {
    if (!searchTerm) return faculty;
    
    return faculty.filter(member => {
      const searchLower = searchTerm.toLowerCase();
      return (
        member.name.toLowerCase().includes(searchLower) ||
        member.department.toLowerCase().includes(searchLower) ||
        member.roomNumber.toLowerCase().includes(searchLower) ||
        member.weekOffDay.toLowerCase().includes(searchLower)
      );
    });
  }, [faculty, searchTerm]);

  // Separate faculty by department type and role
  const scoftFaculty = filteredFaculty.filter(member => 
    SCOFT_DEPARTMENTS.includes(member.department) && !member.isHOD
  );
  
  const scoftHODs = filteredFaculty.filter(member => 
    SCOFT_DEPARTMENTS.includes(member.department) && member.isHOD
  );
  
  const nonScoftFaculty = filteredFaculty.filter(member => 
    NON_SCOFT_DEPARTMENTS.includes(member.department) && !member.isHOD
  );
  
  const nonScoftHODs = filteredFaculty.filter(member => 
    NON_SCOFT_DEPARTMENTS.includes(member.department) && member.isHOD
  );

  return (
    <div className="bg-slate-900 text-white min-h-screen p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Search className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Search Faculty Rooms</h1>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, department, room number or week off day..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Faculty Rooms Section */}
      <div className="mb-12">
        <div className="bg-slate-800 rounded-t-lg p-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-center">FACULTY ROOMS</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* SCOFT Section */}
          <div className="bg-slate-800 border-r border-slate-700">
            <div className="bg-blue-600 p-3">
              <h3 className="font-semibold text-center">SCOFT</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-300 border-b border-slate-700 pb-2">
                <div>Department</div>
                <div>Faculty Name</div>
                <div>Room</div>
                <div>Week Off</div>
              </div>
              
              <div className="space-y-3">
                {scoftFaculty.map((member) => (
                  <div key={member.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-slate-700 last:border-b-0">
                    <div className="text-gray-300">{member.department}</div>
                    <div className="text-white">{member.name}</div>
                    <div className="text-blue-400 font-medium">{member.roomNumber}</div>
                    <div className="text-yellow-400 font-medium">{member.weekOffDay}</div>
                  </div>
                ))}
                
                {scoftFaculty.length === 0 && (
                  <div className="text-center text-gray-400 py-4">No faculty found</div>
                )}
              </div>
            </div>
          </div>

          {/* NON SCOFT Section */}
          <div className="bg-slate-800">
            <div className="bg-slate-700 p-3">
              <h3 className="font-semibold text-center">NON SCOFT</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-300 border-b border-slate-700 pb-2">
                <div>Department</div>
                <div>Faculty Name</div>
                <div>Room</div>
                <div>Week Off</div>
              </div>
              
              <div className="space-y-3">
                {nonScoftFaculty.map((member) => (
                  <div key={member.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-slate-700 last:border-b-0">
                    <div className="text-gray-300">{member.department}</div>
                    <div className="text-white">{member.name}</div>
                    <div className="text-blue-400 font-medium">{member.roomNumber}</div>
                    <div className="text-yellow-400 font-medium">{member.weekOffDay}</div>
                  </div>
                ))}
                
                {nonScoftFaculty.length === 0 && (
                  <div className="text-center text-gray-400 py-4">No faculty found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOD Rooms Section */}
      <div>
        <div className="bg-slate-800 rounded-t-lg p-4 border-b border-slate-700">
          <h2 className="text-lg font-medium text-center">HOD ROOMS</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* SCOFT HODs */}
          <div className="bg-slate-800 border-r border-slate-700">
            <div className="bg-blue-600 p-3">
              <h3 className="font-semibold text-center">SCOFT</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-300 border-b border-slate-700 pb-2">
                <div>Department</div>
                <div>HOD Name</div>
                <div>Room</div>
                <div>Week Off</div>
              </div>
              
              <div className="space-y-3">
                {scoftHODs.map((member) => (
                  <div key={member.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-slate-700 last:border-b-0">
                    <div className="text-gray-300">{member.department}</div>
                    <div className="text-white">{member.name}</div>
                    <div className="text-blue-400 font-medium">{member.roomNumber}</div>
                    <div className="text-yellow-400 font-medium">{member.weekOffDay}</div>
                  </div>
                ))}
                
                {scoftHODs.length === 0 && (
                  <div className="text-center text-gray-400 py-4">No HODs found</div>
                )}
              </div>
            </div>
          </div>

          {/* NON SCOFT HODs */}
          <div className="bg-slate-800">
            <div className="bg-slate-700 p-3">
              <h3 className="font-semibold text-center">NON SCOFT</h3>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-4 gap-4 mb-3 text-sm font-medium text-gray-300 border-b border-slate-700 pb-2">
                <div>Department</div>
                <div>HOD Name</div>
                <div>Room</div>
                <div>Week Off</div>
              </div>
              
              <div className="space-y-3">
                {nonScoftHODs.map((member) => (
                  <div key={member.id} className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-slate-700 last:border-b-0">
                    <div className="text-gray-300">{member.department}</div>
                    <div className="text-white">{member.name}</div>
                    <div className="text-blue-400 font-medium">{member.roomNumber}</div>
                    <div className="text-yellow-400 font-medium">{member.weekOffDay}</div>
                  </div>
                ))}
                
                {nonScoftHODs.length === 0 && (
                  <div className="text-center text-gray-400 py-4">No HODs found</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}