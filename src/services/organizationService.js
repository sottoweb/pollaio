import { supabase } from './supabaseClient';

export const organizationService = {

    // Get Organization by ID
    async getOrganizationById(id) {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get User's Organization (returns the first one linked)
    async getUserOrganization(userId) {
        const { data, error } = await supabase
            .from('organization_members')
            .select('organization_id, role, organizations(*)')
            .eq('user_id', userId)
            .single(); // Assuming single org for now

        if (error) {
            // Handle "No rows found" gracefully
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data?.organizations || null;
    },

    // Update Organization Details
    async updateOrganization(id, updates) {
        const { data, error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Upload Logo
    async uploadLogo(file) {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('company-logos')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('company-logos')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    // --- TEAM MEMBERS ---

    async getMembers(orgId) {
        const { data, error } = await supabase
            .from('organization_members')
            .select('id, user_id, role, profiles(email, first_name, last_name, avatar_url)')
            .eq('organization_id', orgId);

        if (error) throw error;
        return data;
    },

    async removeMember(memberId) {
        const { error } = await supabase
            .from('organization_members')
            .delete()
            .eq('id', memberId);

        if (error) throw error;
    },

    // --- INVITATIONS ---

    async getInvitations(orgId) {
        const { data, error } = await supabase
            .from('invitations')
            .select('*')
            .eq('organization_id', orgId)
            .eq('status', 'pending');

        if (error) throw error;
        return data;
    },

    async createInvitation(orgId, email, role = 'member') {
        const { data, error } = await supabase
            .from('invitations')
            .insert([{
                organization_id: orgId,
                email,
                role
            }])
            .select()
            .single();

        if (error) throw error;
        return data; // contains the token
    },

    async deleteInvitation(id) {
        const { error } = await supabase
            .from('invitations')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- INVITE ACCEPTANCE (RPC) ---

    async getInviteDetails(token) {
        const { data, error } = await supabase
            .rpc('get_invite_details', { lookup_token: token });

        if (error) throw error;
        return data;
    },

    async acceptInvitation(token) {
        const { data, error } = await supabase
            .rpc('accept_invitation', { lookup_token: token });

        if (error) throw error;
        return data;
    }
};
