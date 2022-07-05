//unused-component
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rFetch } from '../../utils/rFetch';
import { Link } from 'react-router-dom';
import chainData from '../../utils/blockchainData';
import { getTokenError } from '../../ducks/auth/actions';
import { RootState } from '../../ducks';
import { ColorStoreType } from '../../ducks/colors/colorStore.types';
import { TDiamondTokensType } from './nft.types';

const MyNFTs = () => {
  const dispatch = useDispatch();

  const [tokens, setTokens] = useState<TDiamondTokensType[]>();
  const fetchData = useCallback(async () => {
    const response = await rFetch('/api/nft');

    if (response.success) {
      const tokenData: TDiamondTokensType[] = [];
      for await (const token of response.result) {
        const contractData = await rFetch(
          `/api/contracts/singleContract/${token.contract}`
        );
        tokenData.push({
          ...token,
          ...contractData.contract
        });
      }
      setTokens(tokenData);
    }

    if (response.error && response.message) {
      dispatch(getTokenError(response.error));
    }
  }, [dispatch]);

  const { primaryColor, textColor } = useSelector<RootState, ColorStoreType>(
    (state) => state.colorStore
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="row px-0 mx-0">
      {tokens
        ? tokens.length > 0 &&
          tokens.map((item: TDiamondTokensType, index: number) => {
            return (
              <div key={index} className="p-2 my-2 col-4">
                <div
                  className="w-100 bg-blockchain p-2"
                  style={{
                    border: `solid 1px ${textColor}`,
                    backgroundImage: item.blockchain
                      ? `url(${chainData[item?.blockchain]?.image})`
                      : '',
                    backgroundColor: `var(--${primaryColor}-transparent)`
                  }}>
                  <small style={{ fontSize: '0.7rem' }}>
                    {item.contractAddress}:{item.uniqueIndexInContract}
                  </small>
                  <br />
                  {item.metadata ? (
                    <>
                      <div className="w-100">
                        <img
                          alt="NFT"
                          src={item.metadata.image}
                          style={{
                            width: 'auto',
                            height: 'auto',
                            maxHeight: '30vh'
                          }}
                        />
                      </div>
                      <b>{item.metadata.name}</b>
                      <br />
                      <small>{item.metadata.description}</small>
                      <br />
                      <small>
                        {item.metadata.attributes?.length} attributes!
                      </small>
                    </>
                  ) : (
                    <b> No metadata available </b>
                  )}
                  <br />
                  <Link
                    to={`/token/${item.blockchain}/${item.contractAddress}/${item.uniqueIndexInContract}`}
                    className="btn btn-stimorol">
                    View Token
                  </Link>
                </div>
              </div>
            );
          })
        : 'Fetching data...'}
    </div>
  );
};

export default MyNFTs;
