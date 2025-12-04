import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, CheckCircle, Clock, AlertTriangle, Building2, DollarSign } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { GemCard } from '@/components/gems/GemCard';
import { CreateGemModal } from '@/components/gems/CreateGemModal';
import { EditGemModal } from '@/components/gems/EditGemModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatsCard } from '@/components/common/StatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useGems } from '@/hooks/useGems';
import { useTasks } from '@/hooks/useTasks';
import { Gem } from '@/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { gems, loading: gemsLoading, createGem, updateGem, deleteGem } = useGems();
  const { tasks, presentTasks, futureTasks, pastTasks } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gemToEdit, setGemToEdit] = useState<Gem | null>(null);
  const [gemToDelete, setGemToDelete] = useState<Gem | null>(null);

  const filteredGems = gems.filter(gem =>
    gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gem.phone.includes(searchQuery)
  );

  const handleOpenGem = (gem: Gem) => {
    navigate(`/admin/gem/${gem.id}`);
  };

  const handleCreateGem = async (data: { name: string; phone: string; email: string; password: string; fixedDriveUrl?: string }) => {
    await createGem(data);
  };

  const handleEditGem = async (gemId: string, data: { name: string; phone: string; fixedDriveUrl?: string }) => {
    await updateGem(gemId, data);
    setGemToEdit(null);
  };

  const handleDeleteGem = async () => {
    if (gemToDelete) {
      await deleteGem(gemToDelete.id);
      setGemToDelete(null);
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  if (gemsLoading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <Layout>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your team and track progress</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          title="Total Gems"
          value={gems.length}
          icon={Users}
          variant="primary"
          index={0}
        />
        <StatsCard
          title="Today's Tasks"
          value={presentTasks.length}
          icon={Clock}
          variant="warning"
          index={1}
        />
        <StatsCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          variant="success"
          index={2}
        />
        <StatsCard
          title="Pending"
          value={pendingTasks}
          icon={AlertTriangle}
          variant="destructive"
          index={3}
        />
      </div>

      {/* Quick Access Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6 sm:mb-8"
      >
        <Card 
          variant="elevated" 
          className="cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => navigate('/admin/clients')}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft flex-shrink-0">
                  <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">Clients & Finance</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">Manage clients, track revenue and expenses</p>
                </div>
              </div>
              <Button variant="gradient" className="w-full sm:w-auto">
                <DollarSign className="w-5 h-5 mr-2" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gems by name or phone..."
            className="pl-11"
          />
        </div>
        <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Gem
        </Button>
      </motion.div>

      {/* Gems Grid */}
      {filteredGems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGems.map((gem, index) => (
            <GemCard
              key={gem.id}
              gem={gem}
              onOpen={handleOpenGem}
              onEdit={setGemToEdit}
              onDelete={setGemToDelete}
              index={index}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {searchQuery ? 'No gems found' : 'No gems yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? 'Try a different search term' : 'Create your first gem to get started'}
          </p>
          {!searchQuery && (
            <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Gem
            </Button>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <CreateGemModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGem}
      />

      <EditGemModal
        gem={gemToEdit}
        isOpen={!!gemToEdit}
        onClose={() => setGemToEdit(null)}
        onSubmit={handleEditGem}
      />

      <ConfirmDialog
        isOpen={!!gemToDelete}
        onClose={() => setGemToDelete(null)}
        onConfirm={handleDeleteGem}
        title="Delete Gem"
        message={`Are you sure you want to delete ${gemToDelete?.name}? This action cannot be undone and will also remove all their tasks.`}
        confirmText="Delete"
        variant="danger"
      />
    </Layout>
  );
};

export default AdminDashboard;
