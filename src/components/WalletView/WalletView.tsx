import React, { useCallback, useContext, useEffect, useState } from "react";
import WalletIcon from "images/wallet/wallet.inline.svg";
import ZigCoinIcon from "images/wallet/zignaly-coin.svg";
import ListIcon from "images/wallet/list.inline.svg";
import TrophyIcon from "images/wallet/trophy.inline.svg";
import TrophyDarkIcon from "images/wallet/trophy-dark.inline.svg";
import { FormattedMessage } from "react-intl";
import { isMobile, Panel, SubTitle, Title } from "styles/styles";
import styled, { css } from "styled-components";
import {
  Button as MuiButton,
  Box,
  ClickAwayListener,
  Tooltip,
  Typography,
  FormControlLabel,
  Switch,
} from "@material-ui/core";
import tradeApi from "services/tradeApiClient";
import CustomButton from "components/CustomButton";
import Modal from "components/Modal";
import WalletDepositView from "./WalletDepositView";
import PrivateAreaContext from "context/PrivateAreaContext";
import { ChevronRight } from "@material-ui/icons";
import WalletTransactions from "./WalletTransactions";
import BalanceChain from "./BalanceChain";
import { TitleIcon } from "./styles";
import NumberFormat from "react-number-format";
import theme from "services/theme";
import { useStoreUserData } from "hooks/useStoreUserSelector";

const CategIconStyled = styled.img`
  margin: 31px 14px 0 0;

  ${isMobile(`
    display: none;
  `)}
`;

const TrophyIconStyled = styled(CategIconStyled).attrs(({ theme }) => ({
  as: theme.palette.type === "dark" ? TrophyDarkIcon : TrophyIcon,
}))`
  min-width: 64px;
  min-height: 64px;
`;

const StyledPanel = styled(Panel)`
  display: flex;
  justify-content: space-around;
  padding: 40px 0;

  ${isMobile(`
    flex-direction: column;
    padding: 40px 28px;
  `)}
`;

const Rate = styled.span`
  color: #65647e;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.66px;
  line-height: 14px;
  margin: 0 8px;
  text-transform: uppercase;
`;

const ZigBig = styled.span`
  /* color: #9864ef; */
  color: ${(props) => props.theme.palette.text.secondary};
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 16px;
  margin-left: 6px;
`;

const SecondaryText = styled(Typography)`
  color: ${(props) => props.theme.newTheme.secondaryText};
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 1px;
  white-space: nowrap;
`;

const Button = styled(CustomButton)`
  margin-right: 8px;
  min-width: 121px;
`;

const TextMain = styled(Typography)`
  /* color: #9ca3af; */
  font-size: 32px;
  font-weight: 500;
  /* line-height: 40px; */
  letter-spacing: 0.66px;
`;

const TextCaption = styled(Typography)`
  /* color: #f3f4f6; */
  font-size: 16px;
  /* line-height: 20px; */
  letter-spacing: 0.33px;
  margin-top: 20px;
`;

const Divider = styled.span`
  background: ${({ theme }) => (theme.palette.type === "dark" ? "#222249" : "#ACB6FF")};
  width: 1px;
  height: 128px;
  align-self: center;

  ${isMobile(`
    display: none;
  `)}
`;

const ChevronRightStyled = styled(ChevronRight)`
  color: #65647e;
  cursor: pointer;
`;

interface PanelItemProps {
  row?: boolean;
}
const PanelItem = styled.div`
  display: flex;
  flex-direction: ${(props: PanelItemProps) => (props.row ? "row" : "column")};
  flex-basis: 24%;

  ${(props) =>
    props.row &&
    css`
      justify-content: center;
    `}

  ${isMobile(`
    &:not(:first-child) {
      margin: 48px 0 0;
    }
  `)}
`;

const ButtonBuy = styled(MuiButton)`
  display: flex;
  padding: 4px 12px 4px 16px;
  /* box-shadow: 0px 4px 8px -4px rgba(90, 81, 245, 0.25); */
  border-radius: 4px;
  border: 1px solid;
  font-size: 13px;
  border-image: linear-gradient(
    312.12deg,
    rgba(134, 113, 247, 0.33) 14.16%,
    rgba(126, 201, 249, 0.33) 83.59%
  );
  border-image-slice: 1;
  text-transform: none;
  font-weight: 600;
  font-size: 13px;
  line-height: 16px;
  /* background: transparent; */
`;
const StyledTooltip = styled.div`
  .MuiTooltip-tooltip {
    background: #f3f4f6;
    box-shadow: 0px 4px 8px -4px rgba(90, 81, 245, 0.25);
    border-radius: 3px;
    padding: 8px 16px;
  }
`;

// const TooltipContainer = styled((props) => (
//   <Tooltip classes={{ popper: props.className }} {...props} />
// ))`
//   & .MuiTooltip-tooltip {
//     background-color: papayawhip;
//     color: #000;
//   }
// `;

const TooltipContainer = styled.div`
  font-weight: 600;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  a {
    text-decoration: none;
  }
`;

const TypographyTooltip = styled.span`
  color: #0c0d21;
  margin-bottom: 3px;
`;

const RateText = styled.span`
  margin-top: 2px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.newTheme.secondaryText};
  font-weight: 600;
  font-size: 16px;
`;

const ValueBig = styled.span`
  white-space: nowrap;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  text-align: right;
  color: ${({ theme }) => theme.newTheme.green};
  margin-left: 8px;
`;

const SwitchLabel = styled.span`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0.33px;

  ${(props) =>
    props.enabled &&
    css`
      color: ${props.theme.newTheme.green};
    `}
`;

const StyledSwitch = styled(Switch)`
  margin: 8px 0;

  .MuiSwitch-switchBase.Mui-checked {
    color: ${({ theme }) => theme.newTheme.green};
  }

  .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track {
    background-color: ${({ theme }) => theme.newTheme.green};
  }
`;

const FeeLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
`;

const WalletView = () => {
  const { walletBalance } = useContext(PrivateAreaContext);
  const [path, setPath] = useState("");
  const [rateZIG, setRateZIG] = useState<number>(null);
  // const [balances, setBalances] = useState<WalletBalance>(null);
  const [coins, setCoins] = useState<WalletCoins>(null);
  const balanceZIG = walletBalance?.ZIG?.total || 0;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const userData = useStoreUserData();
  const [feesZig, setFeesZig] = useState(userData.feesZig);

  const handleTooltipClose = () => {
    setTooltipOpen(false);
  };

  const handleTooltipOpen = () => {
    setTooltipOpen(true);
  };

  useEffect(() => {
    // tradeApi.getWalletBalance().then((response) => {
    //   setBalances(response);
    // });
    tradeApi.convertPreview({ from: "ZIG", to: "USDT", qty: 1 }).then((response) => {
      setRateZIG(response.lastPrice);
    });

    tradeApi.getWalletCoins().then((response) => {
      setCoins(response);
    });
  }, []);

  const BuyZig = useCallback(
    () => (
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <StyledTooltip>
          <Tooltip
            interactive
            placement="right"
            onClose={handleTooltipClose}
            open={tooltipOpen}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            PopperProps={{
              disablePortal: true,
            }}
            title={
              <TooltipContainer>
                <TypographyTooltip>
                  <FormattedMessage id="wallet.buy.tooltip" />
                </TypographyTooltip>
                <a href="https://ascendex.com" rel="noreferrer" target="_blank">
                  AscendEX &gt;
                </a>
                <a href="https://mexc.com" rel="noreferrer" target="_blank">
                  MEXC &gt;
                </a>
              </TooltipContainer>
            }
          >
            <ButtonBuy onClick={handleTooltipOpen}>
              <FormattedMessage id="wallet.buy" />
              <ChevronRightStyled />
            </ButtonBuy>
          </Tooltip>
        </StyledTooltip>
      </ClickAwayListener>
    ),
    [tooltipOpen],
  );

  // const WalletIcon = (props) => (
  //   <svg width="34" height="30" viewBox="0 0 34 30" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <path
  //       d="M29.287 5.35714V4.28571C29.287 1.91853 27.3265 0 24.9075 0H6.9026C3.2744 0 0.333252 2.87813 0.333252 6.42857V23.5714C0.333252 27.1219 3.2744 30 6.9026 30H29.287C31.706 30 33.6666 28.0815 33.6666 25.7143V9.64286C33.6666 7.27567 31.706 5.35714 29.287 5.35714ZM30.3819 25.7143C30.3819 26.3049 29.8906 26.7857 29.287 26.7857H6.9026C5.09124 26.7857 3.61792 25.344 3.61792 23.5714V6.42857C3.61792 4.65603 5.09124 3.21429 6.9026 3.21429H24.9075C25.511 3.21429 26.0024 3.69509 26.0024 4.28571V6.42857H7.99749C7.39256 6.42857 6.9026 6.90804 6.9026 7.5C6.9026 8.09196 7.39256 8.57143 7.99749 8.57143H29.287C29.8906 8.57143 30.3819 9.05223 30.3819 9.64286V25.7143ZM24.9075 15C23.6983 15 22.7177 15.9596 22.7177 17.1429C22.7177 18.3261 23.6983 19.2857 24.9075 19.2857C26.1166 19.2857 27.0972 18.3261 27.0972 17.1429C27.0972 15.9596 26.1166 15 24.9075 15Z"
  //       fill="url(#paint0_linear_594:4159)"
  //     />
  //     <defs>
  //       <linearGradient
  //         id="paint0_linear_594:4159"
  //         x1="6.06242"
  //         y1="-1.89648e-07"
  //         x2="35.192"
  //         y2="19.6111"
  //         gradientUnits="userSpaceOnUse"
  //       >
  //         <stop stop-color="#A600FB" />
  //         <stop offset="0.260417" stop-color="#6F06FC" />
  //         <stop offset="0.625" stop-color="#4959F5" />
  //         <stop offset="0.828125" stop-color="#2E8DDF" />
  //         <stop offset="1" stop-color="#12C1C9" />
  //       </linearGradient>
  //     </defs>
  //   </svg>
  // );

  return (
    <Box p={5}>
      <Modal
        // onClose={() => dispatch(showCreateTrader(false))}
        onClose={() => setPath("")}
        newTheme={true}
        persist={false}
        size="medium"
        state={path === "deposit"}
      >
        <WalletDepositView coins={coins} />
      </Modal>
      <Title>
        <Box alignItems="center" display="flex">
          {/* <TitleIcon height="30px" src={WalletIcon} width="33px" /> */}
          <WalletIcon />
          <FormattedMessage id="wallet.zig" />
        </Box>
      </Title>
      <StyledPanel>
        <PanelItem row>
          <CategIconStyled height={66} src={ZigCoinIcon} width={66} />
          <Box display="flex" flexDirection="column">
            <SubTitle>
              <FormattedMessage id="wallet.totalbalance" />
            </SubTitle>
            <TextMain>
              {balanceZIG}
              <ZigBig>ZIG</ZigBig>
            </TextMain>
            <RateText>
              <NumberFormat
                value={balanceZIG * rateZIG}
                displayType="text"
                thousandSeparator={true}
                prefix="$"
                decimalScale={2}
              />
              <Rate>@{rateZIG}/ZIG</Rate>
              {/* <ArrowIcon width={32} height={32} src={WalletIcon} /> */}
            </RateText>
            <BalanceChain coins={coins} walletBalance={walletBalance} />
            <Box mt="2px">
              <BuyZig />
            </Box>
            <Box display="flex" flexDirection="row" mt={2.25}>
              <Button className="textPurple borderPurple" href="#exchangeAccounts">
                <FormattedMessage id="accounts.withdraw" />
              </Button>
              {/* <Button className="bgPurple" href="#deposit"> */}
              <Button className="bgPurple" onClick={() => setPath("deposit")}>
                <FormattedMessage id="accounts.deposit" />
              </Button>
            </Box>
          </Box>
        </PanelItem>
        <Divider />
        <PanelItem row>
          <TrophyIconStyled />
          <Box display="flex" flexDirection="column">
            <SubTitle>
              <FormattedMessage id="wallet.rewards" />
            </SubTitle>
            <TextMain>
              <FormattedMessage id="wallet.fees.title" />
            </TextMain>
            <FormControlLabel
              control={<StyledSwitch checked={feesZig} onChange={() => setFeesZig(!feesZig)} />}
              label={
                <SwitchLabel enabled={feesZig}>
                  <FormattedMessage id={feesZig ? "wallet.fees.enabled" : "wallet.fees.zig"} />
                </SwitchLabel>
              }
            />
            <FeeLine>
              <SecondaryText noWrap>
                <FormattedMessage id="wallet.fees.discount" />
              </SecondaryText>
              <ValueBig>
                <FormattedMessage id="wallet.fees.min" values={{ perc: 6 }} />
              </ValueBig>
            </FeeLine>
            <FeeLine>
              <SecondaryText noWrap>
                <FormattedMessage id="wallet.fees.rebate" />
              </SecondaryText>
              <ValueBig>
                <FormattedMessage id="wallet.fees.rebate.soon" />
              </ValueBig>
            </FeeLine>
          </Box>
        </PanelItem>
        <Divider />
        <PanelItem>
          <SubTitle>
            <FormattedMessage id="wallet.staking" />
          </SubTitle>
          <TextMain>
            <FormattedMessage id="wallet.staking.soon" />
          </TextMain>
          <TextCaption>
            <FormattedMessage id="wallet.staking.soon.desc" />
          </TextCaption>
        </PanelItem>
      </StyledPanel>
      <Title>
        <Box alignItems="center" display="flex" mt="64px">
          <ListIcon />
          <FormattedMessage id="wallet.transactions" />
        </Box>
      </Title>
      <WalletTransactions />
    </Box>
  );
};

export default WalletView;
