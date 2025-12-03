import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { GemCard } from '@/components/gems/GemCard';
import { CreateGemModal } from '@/components/gems/CreateGemModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatsCard } from '@/components/common/StatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGems } from '@/hooks/useGems';
import { useTasks } from '@/hooks/useTasks';
import { Gem } from '@/types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { gems, loading: gemsLoading, createGem, deleteGem } = useGems();
  const { tasks, presentTasks, futureTasks, pastTasks } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gemToDelete, setGemToDelete] = useState<Gem | null>(null);

  const filteredGems = gems.filter(gem =>
    gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gem.phone.includes(searchQuery)
  );

  const handleOpenGem = (gem: Gem) => {
    navigate(`/admin/gem/${gem.id}`);
  };

  const handleCreateGem = async (data: { name: string; phone: string; email: string; password: string }) => {
    await createGem(data);
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
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your team and track progress</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
