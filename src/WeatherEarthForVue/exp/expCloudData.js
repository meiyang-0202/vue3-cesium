import {
  parseNameFunc1, parseNameFunc2, parseNameFunc5, parseNameFunc6 
} from './expTimeParse';

function expCloudData() {

}


expCloudData.data = {
  风云2可见光:
    {
      name: 'FY2_VIS',
      parseFunction: parseNameFunc2,
    },
  风云4红外:
    {
      name: 'C013',
      parseFunction: parseNameFunc1,
      legendUrl: './data/FY_Lengend.png'
    },
  风云4中红外:
    {
      name: 'C008',
      parseFunction: parseNameFunc1,
      legendUrl: './data/FY_Lengend.png'
    },
  风云4水汽:
    {
      name: 'C009',
      parseFunction: parseNameFunc1,
    },
  风云4可见光:
    {
      name: 'C003',
      parseFunction: parseNameFunc1,
    },
  柳林h8:
        {
          name: 'h08亮温',
          parseFunction: parseNameFunc6,
          legendUrl: './data/FY_Lengend.png'
        },

  其他:
    {
      name: 'C003',
      parseFunction: parseNameFunc1,
    },
};

export default expCloudData;
