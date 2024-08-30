import {
  fetchChannels,
  createChannel,
  editChannel,
  fetchChannelById
} from '@jembi/openhim-core-api'
import {Channel} from '../types'

export async function getChannels(): Promise<Channel[]> {
  try {
    return await fetchChannels()
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function getChannelById(id: string): Promise<Channel> {
  try {
    return await fetchChannelById(id)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function addChannel(channel: Channel): Promise<void> {
  try {
    await createChannel(channel)
  } catch (err) {
    console.error(err)
    throw err
  }
}

export async function modifyChannel(channel: Channel): Promise<void> {
  try {
    await editChannel(channel)
  } catch (err) {
    console.error(err)
    throw err
  }
}
