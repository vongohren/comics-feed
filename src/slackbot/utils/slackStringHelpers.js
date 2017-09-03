export const showDirectOrChannel = (channel) => {
  if(!channel.includes('@')) return `#${channel}`
  return channel
}
