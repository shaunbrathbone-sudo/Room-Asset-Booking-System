import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface FavouriteDesk {
    favourite_id: string;
    saved_at: string;
    desk_id: string;
    desk_code: string;
    desk_label: string;
    equipment_tags?: string;
    desk_status: string;
    is_bookable: number;
    zone_name: string;
    floor_id: string;
    floor_name: string;
    floor_slug: string;
    floor_number: number;
    office_id: string;
    office_name: string;
    office_slug: string;
    office_city: string;
    country_slug: string;
    country_name: string;
}

export function useFavouriteDesks() {
    const queryClient = useQueryClient();

    const { data: favourites = [], isLoading, refetch } = useQuery<FavouriteDesk[]>({
        queryKey: ['favouriteDesks'],
        queryFn: async () => {
            const { data } = await api.get('/favourites/desks');
            return data;
        },
    });

    const favouriteDeskIds = new Set(favourites.map((f) => f.desk_id));

    const toggleMutation = useMutation({
        mutationFn: async ({ deskId, isFav }: { deskId: string; isFav: boolean }) => {
            if (isFav) {
                await api.delete(`/favourites/desks/${deskId}`);
            } else {
                await api.post(`/favourites/desks/${deskId}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favouriteDesks'] });
        },
    });

    const isFavourite = (deskId: string) => favouriteDeskIds.has(deskId);

    const toggleFavourite = (deskId: string) => {
        const isFav = isFavourite(deskId);
        toggleMutation.mutate({ deskId, isFav });
    };

    return {
        favourites,
        favouriteDeskIds,
        isFavourite,
        toggleFavourite,
        isLoading,
        isPending: toggleMutation.isPending,
        refetch,
    };
}