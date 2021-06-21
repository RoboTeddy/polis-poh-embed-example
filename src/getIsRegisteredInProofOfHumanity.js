import proofOfHumanityAbi from './abi/proofOfHumanityAbi.json'
import {ethers} from 'ethers' // TODO: import more specific thing?
import {POH_CONTRACT_ADDRESS} from './constants'

// returns a promise that resolves to a boolean
export default function getIsRegisteredInProofOfHumanity(
  ethersProvider,
  address
) {
  const contract = new ethers.Contract(
    POH_CONTRACT_ADDRESS,
    proofOfHumanityAbi,
    ethersProvider
  )
  return contract.isRegistered(address)
}
