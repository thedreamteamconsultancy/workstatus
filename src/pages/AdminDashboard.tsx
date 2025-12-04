import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, CheckCircle, Clock, AlertTriangle, Building2, DollarSign, Filter, TrendingUp, TrendingDown, Loader2, Hourglass } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGems } from '@/hooks/useGems';
import { useTasks } from '@/hooks/useTasks';
import { Gem, Task } from '@/types';

type GemFilter = 'all' | 'top-performers' | 'low-performers' | 'has-pending' | 'has-ongoing' | 'has-completed' | 'has-delayed';

// Helper to calculate gem performance metrics
const calculateGemMetrics = (gemId: string, tasks: Task[]) => {
  const gemTasks = tasks.filter(t => t.gemId === gemId);
  const completedTasks = gemTasks.filter(t => t.status === 'completed');
  const pendingTasks = gemTasks.filter(t => t.status === 'pending');
  const ongoingTasks = gemTasks.filter(t => t.status === 'ongoing');
  const delayedTasks = gemTasks.filter(t => t.status === 'delayed');
  
  // Calculate on-time completion rate
  const onTimeCompleted = completedTasks.filter(t => {
    // If task was completed before or on deadline
    const completedDate = t.updatedAt;
    const deadline = t.deadline;
    return completedDate <= deadline;
  }).length;
  
  const completionRate = completedTasks.length > 0 
    ? (onTimeCompleted / completedTasks.length) * 100 
    : 0;
  
  // Performance score: weighted combination of completed tasks and on-time rate
  const performanceScore = (completedTasks.length * 10) + (completionRate * 0.5) - (delayedTasks.length * 5);
  
  return {
    totalTasks: gemTasks.length,
    completedCount: completedTasks.length,
    pendingCount: pendingTasks.length,
    ongoingCount: ongoingTasks.length,
    delayedCount: delayedTasks.length,
    onTimeCompletedCount: onTimeCompleted,
    completionRate,
    performanceScore,
    hasActiveTasks: pendingTasks.length > 0 || ongoingTasks.length > 0 || delayedTasks.length > 0,
  };
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { gems, loading: gemsLoading, createGem, updateGem, deleteGem } = useGems();
  const { tasks, presentTasks, futureTasks, pastTasks } = useTasks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [gemFilter, setGemFilter] = useState<GemFilter>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gemToEdit, setGemToEdit] = useState<Gem | null>(null);
  const [gemToDelete, setGemToDelete] = useState<Gem | null>(null);

  // Calculate metrics for all gems
  const gemMetrics = useMemo(() => {
    const metrics: Record<string, ReturnType<typeof calculateGemMetrics>> = {};
    gems.forEach(gem => {
      metrics[gem.id] = calculateGemMetrics(gem.id, tasks);
    });
    return metrics;
  }, [gems, tasks]);

  // Filter and sort gems
  const filteredAndSortedGems = useMemo(() => {
    // First, filter by search query
    let result = gems.filter(gem =>
      gem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gem.phone.includes(searchQuery)
    );

    // Apply status filter
    switch (gemFilter) {
      case 'top-performers':
        result = result.filter(gem => gemMetrics[gem.id]?.completedCount > 0);
        result.sort((a, b) => (gemMetrics[b.id]?.performanceScore || 0) - (gemMetrics[a.id]?.performanceScore || 0));
        break;
      case 'low-performers':
        result = result.filter(gem => gemMetrics[gem.id]?.totalTasks > 0);
        result.sort((a, b) => (gemMetrics[a.id]?.performanceScore || 0) - (gemMetrics[b.id]?.performanceScore || 0));
        break;
      case 'has-pending':
        result = result.filter(gem => gemMetrics[gem.id]?.pendingCount > 0);
        result.sort((a, b) => (gemMetrics[b.id]?.pendingCount || 0) - (gemMetrics[a.id]?.pendingCount || 0));
        break;
      case 'has-ongoing':
        result = result.filter(gem => gemMetrics[gem.id]?.ongoingCount > 0);
        result.sort((a, b) => (gemMetrics[b.id]?.ongoingCount || 0) - (gemMetrics[a.id]?.ongoingCount || 0));
        break;
      case 'has-completed':
        result = result.filter(gem => gemMetrics[gem.id]?.completedCount > 0);
        result.sort((a, b) => (gemMetrics[b.id]?.completedCount || 0) - (gemMetrics[a.id]?.completedCount || 0));
        break;
      case 'has-delayed':
        result = result.filter(gem => gemMetrics[gem.id]?.delayedCount > 0);
        result.sort((a, b) => (gemMetrics[b.id]?.delayedCount || 0) - (gemMetrics[a.id]?.delayedCount || 0));
        break;
      default:
        // Default: Sort by active tasks (gems with tasks on top), then by performance
        result.sort((a, b) => {
          const aHasActive = gemMetrics[a.id]?.hasActiveTasks ? 1 : 0;
          const bHasActive = gemMetrics[b.id]?.hasActiveTasks ? 1 : 0;
          if (bHasActive !== aHasActive) return bHasActive - aHasActive;
          // Secondary sort by total tasks
          return (gemMetrics[b.id]?.totalTasks || 0) - (gemMetrics[a.id]?.totalTasks || 0);
        });
    }

    return result;
  }, [gems, searchQuery, gemFilter, gemMetrics]);

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
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6"
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
        <Select value={gemFilter} onValueChange={(value: GemFilter) => setGemFilter(value)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter gems" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Gems
              </span>
            </SelectItem>
            <SelectItem value="top-performers">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Top Performers
              </span>
            </SelectItem>
            <SelectItem value="low-performers">
              <span className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-orange-500" />
                Need Attention
              </span>
            </SelectItem>
            <SelectItem value="has-pending">
              <span className="flex items-center gap-2">
                <Hourglass className="w-4 h-4 text-yellow-500" />
                Has Pending
              </span>
            </SelectItem>
            <SelectItem value="has-ongoing">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500" />
                In Progress
              </span>
            </SelectItem>
            <SelectItem value="has-completed">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Has Completed
              </span>
            </SelectItem>
            <SelectItem value="has-delayed">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Has Delayed
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button variant="gradient" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Create Gem
        </Button>
      </motion.div>

      {/* Gems Grid */}
      {filteredAndSortedGems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedGems.map((gem, index) => (
            <GemCard
              key={gem.id}
              gem={gem}
              onOpen={handleOpenGem}
              onEdit={setGemToEdit}
              onDelete={setGemToDelete}
              index={index}
              metrics={gemMetrics[gem.id]}
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
            {searchQuery || gemFilter !== 'all' ? 'No gems found' : 'No gems yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || gemFilter !== 'all' ? 'Try a different search or filter' : 'Create your first gem to get started'}
          </p>
          {!searchQuery && gemFilter === 'all' && (
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
