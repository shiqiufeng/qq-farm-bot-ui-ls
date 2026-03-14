import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export interface Land {
  id: number
  plantName?: string
  phaseName?: string
  seedImage?: string
  status: string
  matureInSec: number
  needWater?: boolean
  needWeed?: boolean
  needBug?: boolean
  [key: string]: any
}

export interface Seed {
  seedId: number
  name: string
  requiredLevel?: number
  price?: number
  locked?: boolean
  soldOut?: boolean
  plantId?: number
  image?: string
  seedImage?: string
  itemImage?: string
  icon?: string
  iconUrl?: string
  landLevelNeed?: number
  land_level_need?: number
  unlockLevel?: number
  levelNeed?: number
  [key: string]: any
}

export interface Summary {
  [key: string]: any
}

export type SingleLandAction = 'remove' | 'plant' | 'organic_fertilize'
export type OperateType = string

export const useFarmStore = defineStore('farm', () => {
  const lands = ref<Land[]>([])
  const seeds = ref<Seed[]>([])
  const summary = ref<Summary>({})
  const loading = ref(false)

  async function fetchLands(accountId: string) {
    if (!accountId)
      return
    loading.value = true
    try {
      const { data } = await api.get('/api/lands', {
        headers: { 'x-account-id': accountId },
      })
      if (data && data.ok) {
        lands.value = data.data.lands || []
        summary.value = data.data.summary || {}
      }
    }
    catch (e) {
      console.error('Failed to fetch lands:', e)
    }
    finally {
      loading.value = false
    }
  }

  async function fetchSeeds(accountId: string) {
    if (!accountId)
      return
    try {
      const { data } = await api.get('/api/seeds', {
        headers: { 'x-account-id': accountId },
      })
      if (data && data.ok)
        seeds.value = data.data || []
    }
    catch (e) {
      console.error('Failed to fetch seeds:', e)
    }
  }

  async function operate(accountId: string, opType: OperateType) {
    if (!accountId)
      return
    try {
      await api.post('/api/farm/operate', { opType }, {
        headers: { 'x-account-id': accountId },
      })
      await fetchLands(accountId)
    }
    catch (e) {
      console.error('Failed to operate farm:', e)
    }
  }

  async function operateSingleLand(accountId: string, payload: { action: SingleLandAction, landId: number, seedId?: number }) {
    if (!accountId)
      return null
    try {
      const body = {
        action: payload.action,
        landId: payload.landId,
        seedId: payload.seedId || 0,
      }
      const { data } = await api.post('/api/farm/land/operate', body, {
        headers: { 'x-account-id': accountId },
      })
      await fetchLands(accountId)
      return data?.data || null
    }
    catch (e) {
      console.error('Failed to operate single land:', e)
      return null
    }
  }

  return { lands, summary, seeds, loading, fetchLands, fetchSeeds, operate, operateSingleLand }
})
