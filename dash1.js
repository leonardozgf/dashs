import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, MapPin } from 'lucide-react';
import * as Papa from 'papaparse';

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState([]);
  const [regionTotals, setRegionTotals] = useState([]);
  const [peakAnalysis, setPeakAnalysis] = useState({ highest: [], lowest: [] });
  const [selectedView, setSelectedView] = useState('timeline');

  const csvData = `Data;Dia da semana;São Paulo Full;Rio de Janeiro Full;Curitiba Full;Salvador Full;Porto alegre Full;São Paulo XD;Rio de Janeiro XD;Curitiba XD;Salvador XD;Porto alegre XD
01/11/2024;sexta-feira;97351.05;162251.75;162251.75;129801.40;97351.05;50623.36;84372.26;84372.26;67497.81;50623.36
02/11/2024;sábado;77588.10;129313.50;129313.50;103450.80;77588.10;36888.26;61480.43;61480.43;49184.35;36888.26
03/11/2024;domingo;91594.50;152657.50;152657.50;122126.00;91594.50;42912.42;71520.70;71520.70;57216.56;42912.42
04/11/2024;segunda-feira;136768.35;227947.25;227947.25;182357.80;136768.35;73522.97;122538.28;122538.28;98030.63;73522.97
05/11/2024;terça-feira;137598.15;229330.25;229330.25;183464.20;137598.15;66729.69;111216.15;111216.15;88972.92;66729.69
06/11/2024;quarta-feira;134763.75;224606.25;224606.25;179685.00;134763.75;72996.88;121661.47;121661.47;97329.17;72996.88
07/11/2024;quinta-feira;128516.85;214194.75;214194.75;171355.80;128516.85;68962.84;114938.07;114938.07;91950.45;68962.84
08/11/2024;sexta-feira;114593.25;190988.75;190988.75;152791.00;114593.25;61796.02;102993.36;102993.36;82394.69;61796.02
09/11/2024;sábado;89593.35;149322.25;149322.25;119457.80;89593.35;42699.53;71165.89;71165.89;56932.71;42699.53
10/11/2024;domingo;93968.40;156614.00;156614.00;125291.20;93968.40;44520.01;74200.02;74200.02;59360.01;44520.01
11/11/2024;segunda-feira;140310.60;233851.00;233851.00;187080.80;140310.60;75817.29;126362.15;126362.15;101089.72;75817.29
12/11/2024;terça-feira;141164.25;235273.75;235273.75;188219.00;141164.25;77272.30;128787.16;128787.16;103029.73;77272.30
13/11/2024;quarta-feira;138260.10;230433.50;230433.50;184346.80;138260.10;74017.66;123362.76;123362.76;98690.21;74017.66
14/11/2024;quinta-feira;131845.95;219743.25;219743.25;175794.60;131845.95;69760.38;116267.30;116267.30;93013.84;69760.38
15/11/2024;sexta-feira;117564.60;195941.00;195941.00;156752.80;117564.60;63398.07;105663.45;105663.45;84530.76;63398.07
16/11/2024;sábado;91920.15;153200.25;153200.25;122560.20;91920.15;44435.68;74059.47;74059.47;59247.58;44435.68
17/11/2024;domingo;96872.25;161453.75;161453.75;129163.00;96872.25;45614.99;76024.98;76024.98;60819.98;45614.99
18/11/2024;segunda-feira;144646.95;241078.25;241078.25;192862.60;144646.95;77822.27;129703.78;129703.78;103763.02;77822.27
19/11/2024;terça-feira;145530.45;242550.75;242550.75;194040.60;145530.45;78128.59;130214.32;130214.32;104171.46;78128.59
20/11/2024;quarta-feira;142534.65;237557.75;237557.75;190046.20;142534.65;75718.35;126197.25;126197.25;100957.80;75718.35
21/11/2024;quinta-feira;135922.80;226538.00;226538.00;181230.40;135922.80;70463.53;117439.22;117439.22;93951.37;70463.53
22/11/2024;sexta-feira;121205.55;202009.25;202009.25;161607.40;121205.55;63758.04;106263.40;106263.40;85010.72;63758.04
23/11/2024;sábado;94759.05;157931.75;157931.75;126345.40;94759.05;45296.09;75493.48;75493.48;60394.79;45296.09
24/11/2024;domingo;97279.20;162132.00;162132.00;129705.60;97279.20;45972.66;76621.10;76621.10;61296.88;45972.66
25/11/2024;segunda-feira;126925.05;211541.75;211541.75;169233.40;126925.05;67091.66;111819.43;111819.43;89455.55;67091.66
26/11/2024;terça-feira;140551.20;234252.00;234252.00;187401.60;140551.20;73646.72;122744.53;122744.53;98195.62;73646.72
27/11/2024;quarta-feira;144606.00;241010.00;241010.00;192808.00;144606.00;74810.77;124684.62;124684.62;99747.70;74810.77
28/11/2024;quinta-feira;149658.00;249430.00;249430.00;199544.00;149658.00;81702.22;136170.37;136170.37;108936.30;81702.22
29/11/2024;sexta-feira;173253.90;288756.50;288756.50;231005.20;173253.90;94105.28;156842.14;156842.14;125473.71;94105.28
30/11/2024;sábado;99508.95;165848.25;165848.25;132678.60;99508.95;52635.17;87725.29;87725.29;70180.23;52635.17`;

  useEffect(() => {
    const parseData = () => {
      const parsed = Papa.parse(csvData, { 
        header: true, 
        delimiter: ';',
        skipEmptyLines: true,
        dynamicTyping: true
      });
      
      const processedData = parsed.data.map(row => {
        const totalFull = (row['São Paulo Full'] || 0) + (row['Rio de Janeiro Full'] || 0) + 
                         (row['Curitiba Full'] || 0) + (row['Salvador Full'] || 0) + (row['Porto alegre Full'] || 0);
        const totalXD = (row['São Paulo XD'] || 0) + (row['Rio de Janeiro XD'] || 0) + 
                       (row['Curitiba XD'] || 0) + (row['Salvador XD'] || 0) + (row['Porto alegre XD'] || 0);
        
        return {
          data: row.Data,
          diaSemana: row['Dia da semana'],
          totalFull: totalFull,
          totalXD: totalXD,
          totalGeral: totalFull + totalXD,
          spFull: row['São Paulo Full'] || 0,
          rjFull: row['Rio de Janeiro Full'] || 0,
          curitibaFull: row['Curitiba Full'] || 0,
          salvadorFull: row['Salvador Full'] || 0,
          portoAlegreFull: row['Porto alegre Full'] || 0,
          spXD: row['São Paulo XD'] || 0,
          rjXD: row['Rio de Janeiro XD'] || 0,
          curitibaXD: row['Curitiba XD'] || 0,
          salvadorXD: row['Salvador XD'] || 0,
          portoAlegreXD: row['Porto alegre XD'] || 0
        };
      });

      setSalesData(processedData);

      // Calcular totais por região
      const regions = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Salvador', 'Porto Alegre'];
      const regionData = regions.map(region => {
        const fullKey = region === 'São Paulo' ? 'spFull' : 
                       region === 'Rio de Janeiro' ? 'rjFull' :
                       region === 'Curitiba' ? 'curitibaFull' :
                       region === 'Salvador' ? 'salvadorFull' : 'portoAlegreFull';
        const xdKey = region === 'São Paulo' ? 'spXD' : 
                     region === 'Rio de Janeiro' ? 'rjXD' :
                     region === 'Curitiba' ? 'curitibaXD' :
                     region === 'Salvador' ? 'salvadorXD' : 'portoAlegreXD';
        
        const totalFull = processedData.reduce((sum, day) => sum + (day[fullKey] || 0), 0);
        const totalXD = processedData.reduce((sum, day) => sum + (day[xdKey] || 0), 0);
        
        return {
          region,
          full: totalFull,
          xd: totalXD,
          total: totalFull + totalXD
        };
      });

      setRegionTotals(regionData);

      // Análise de picos
      const sortedByTotal = [...processedData].sort((a, b) => b.totalGeral - a.totalGeral);
      const highest = sortedByTotal.slice(0, 5);
      const lowest = sortedByTotal.slice(-5).reverse();

      setPeakAnalysis({ highest, lowest });
    };

    parseData();
  }, []);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard de Vendas - Novembro 2024</h1>
        <p className="text-gray-600">Análise comparativa entre vendas Full e XD por região e período</p>
      </div>

      {/* Navigation */}
      <div className="flex space-x-4 mb-6">
        {['timeline', 'regions', 'peaks'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedView === view 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {view === 'timeline' && <><Calendar className="inline w-4 h-4 mr-2" />Timeline</>}
            {view === 'regions' && <><MapPin className="inline w-4 h-4 mr-2" />Por Região</>}
            {view === 'peaks' && <><TrendingUp className="inline w-4 h-4 mr-2" />Picos de Venda</>}
          </button>
        ))}
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Full</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(salesData.reduce((sum, day) => sum + day.totalFull, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total XD</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(salesData.reduce((sum, day) => sum + day.totalXD, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Geral</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(salesData.reduce((sum, day) => sum + day.totalGeral, 0))}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Proporção XD/Full</h3>
          <p className="text-2xl font-bold text-orange-600">
            {((salesData.reduce((sum, day) => sum + day.totalXD, 0) / 
               salesData.reduce((sum, day) => sum + day.totalFull, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Conteúdo Principal */}
      {selectedView === 'timeline' && (
        <div className="space-y-6">
          {/* Gráfico de linha temporal */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Evolução das Vendas Full vs XD</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value, name) => [formatCurrency(value), name === 'totalFull' ? 'Full' : 'XD']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="totalFull" stroke="#8884d8" name="Full" strokeWidth={2} />
                <Line type="monotone" dataKey="totalXD" stroke="#82ca9d" name="XD" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de barras por dia da semana */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Vendas por Dia da Semana</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="diaSemana" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value, name) => [formatCurrency(value), name === 'totalFull' ? 'Full' : 'XD']} />
                <Legend />
                <Bar dataKey="totalFull" fill="#8884d8" name="Full" />
                <Bar dataKey="totalXD" fill="#82ca9d" name="XD" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedView === 'regions' && (
        <div className="space-y-6">
          {/* Gráfico de barras por região */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Total de Vendas por Região</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={regionTotals}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `R$ ${(value/1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value, name) => [formatCurrency(value), name === 'full' ? 'Full' : 'XD']} />
                <Legend />
                <Bar dataKey="full" fill="#8884d8" name="Full" />
                <Bar dataKey="xd" fill="#82ca9d" name="XD" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pizza charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Distribuição Full por Região</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percent }) => `${region}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="full"
                  >
                    {regionTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Distribuição XD por Região</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={regionTotals}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ region, percent }) => `${region}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="xd"
                  >
                    {regionTotals.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {selectedView === 'peaks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maiores picos */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Top 5 - Maiores Vendas
              </h2>
              <div className="space-y-3">
                {peakAnalysis.highest.map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">{day.data} - {day.diaSemana}</p>
                      <p className="text-sm text-gray-600">
                        Full: {formatCurrency(day.totalFull)} | XD: {formatCurrency(day.totalXD)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(day.totalGeral)}</p>
                      <p className="text-xs text-gray-500">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Menores vendas */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
                Top 5 - Menores Vendas
              </h2>
              <div className="space-y-3">
                {peakAnalysis.lowest.map((day, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">{day.data} - {day.diaSemana}</p>
                      <p className="text-sm text-gray-600">
                        Full: {formatCurrency(day.totalFull)} | XD: {formatCurrency(day.totalXD)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(day.totalGeral)}</p>
                      <p className="text-xs text-gray-500">#{salesData.length - index}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Análise de padrões */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Análise de Padrões</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">Melhor Dia da Semana</h3>
                <p className="text-lg font-bold text-blue-600">
                  {(() => {
                    const dayTotals = {};
                    salesData.forEach(day => {
                      if (!dayTotals[day.diaSemana]) dayTotals[day.diaSemana] = 0;
                      dayTotals[day.diaSemana] += day.totalGeral;
                    });
                    return Object.keys(dayTotals).reduce((a, b) => dayTotals[a] > dayTotals[b] ? a : b);
                  })()}
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">Região Líder</h3>
                <p className="text-lg font-bold text-green-600">
                  {regionTotals.reduce((max, region) => region.total > max.total ? region : max, regionTotals[0] || {})?.region || 'N/A'}
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-800">Crescimento XD</h3>
                <p className="text-lg font-bold text-purple-600">
                  {salesData.length > 0 ? 
                    ((salesData[salesData.length-1]?.totalXD - salesData[0]?.totalXD) / salesData[0]?.totalXD * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-600">vs primeiro dia</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Expor o componente na variável window para acesso direto
window.SalesDashboard = SalesDashboard;

// Manter o export default para compatibilidade
export default SalesDashboard;