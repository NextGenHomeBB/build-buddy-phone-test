import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { userService, UserProfile } from "@/services/userService";

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    admins: 0,
    managers: 0,
    workers: 0,
  });
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        userService.getAllUsers(),
        userService.getUserStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddUser = async () => {
    try {
      toast({
        title: "User Added",
        description: "User has been successfully added to the system.",
      });
      setIsAddUserOpen(false);
      loadUsers(); // Refresh the list
    } catch (error: any) {
      console.error('Failed to add user:', error);
      const errorMessage = error?.message || "Failed to add user. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserProfile['role']) => {
    try {
      await userService.updateUserRole(userId, newRole);
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.deleteUser(userId);
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    filteredUsers,
    loading,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    isAddUserOpen,
    setIsAddUserOpen,
    handleAddUser,
    handleUpdateRole,
    handleDeleteUser,
    stats,
    refreshUsers: loadUsers
  };
};