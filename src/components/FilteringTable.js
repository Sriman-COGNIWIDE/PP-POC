import React, { useState, useEffect, useRef } from 'react';

function CustomDropdown({ isOpen, setIsOpen, options, value, onChange, searchValue, onSearchChange, placeholder, dropdownRef }) {
    const searchInputRef = useRef(null);

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{value || `Select ${placeholder}`}</span>
                <span className="dropdown-arrow">▼</span>
            </div>
            {isOpen && (
                <div className="dropdown-panel">
                    <div className="search-container">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={`Search ${placeholder}...`}
                            className="dropdown-search"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="options-container">
                        {options.map((option, index) => (
                            <div
                                key={index}
                                className="option-item"
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                            >
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function FilteringTable() {
    // State for table data and loading
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // State for filtering and pagination
    const [searchInput, setSearchInput] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;

    // State for dropdowns
    const [isEnvOpen, setIsEnvOpen] = useState(false);
    const [isClusterOpen, setIsClusterOpen] = useState(false);
    const [selectedEnv, setSelectedEnv] = useState('');
    const [selectedCluster, setSelectedCluster] = useState('');
    const [envSearchInput, setEnvSearchInput] = useState('');
    const [clusterSearchInput, setClusterSearchInput] = useState('');

    // Refs for dropdown click outside handling
    const envRef = useRef(null);
    const clusterRef = useRef(null);

    // Available options
    const environments = ['Dev', 'Lit', 'stg', 'CS stg', 'prod', 'cs prod'];
    const clusters = ['dev', 'lit', 'dev_corda', 'np_dmz', 'stg', 'stg_dmz', 'stg_corda', 'prod', 'prod_dmz', 'prod_corda', 'cslit', 'cslit_dmz', 'csstg', 'csstg_dmz', 'csprod'];

    // Filter dropdown options based on search
    const filteredEnvs = environments.filter(env => 
        env.toLowerCase().includes(envSearchInput.toLowerCase())
    );
    
    const filteredClusters = clusters.filter(cluster => 
        cluster.toLowerCase().includes(clusterSearchInput.toLowerCase())
    );

    // Fetch data from API
    const fetchData = async (cluster) => {
        if (!cluster) return;
        
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                'https://8k9nwttiw1.execute-api.eu-west-2.amazonaws.com/default/release-dashboard-api',
                {
                    method: 'POST',
                    mode: 'cors',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ env: cluster.toLowerCase() }),
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            
            const transformedData = responseData.map((item) => ({
                deployment_name: item['deployment-name'] || '',
                namespace: item.namespace || '',
                main_container_images: Array.isArray(item['main-container-images'])
                    ? item['main-container-images'].join(', ')
                    : item['main-container-images'] || '',
                side_container_images: Array.isArray(item['init-container-images'])
                    ? item['init-container-images'].join(', ')
                    : item['init-container-images'] || '',
            }));

            setData(transformedData);
        } catch (err) {
            setError('Failed to fetch data');
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when cluster changes
    useEffect(() => {
        if (selectedCluster) {
            fetchData(selectedCluster);
        }
    }, [selectedCluster]);

    // Handle click outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (envRef.current && !envRef.current.contains(event.target)) {
                setIsEnvOpen(false);
            }
            if (clusterRef.current && !clusterRef.current.contains(event.target)) {
                setIsClusterOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter data based on search input
    const filteredData = data.filter(row => 
        Object.values(row).some(value => 
            value.toLowerCase().includes(searchInput.toLowerCase())
        )
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

    return (
        <div className="table-container">
            <div className="filters-container">
                <div className="dropdowns-wrapper">
                    <CustomDropdown
                        isOpen={isEnvOpen}
                        setIsOpen={setIsEnvOpen}
                        options={filteredEnvs}
                        value={selectedEnv}
                        onChange={setSelectedEnv}
                        searchValue={envSearchInput}
                        onSearchChange={setEnvSearchInput}
                        placeholder="Environment"
                        dropdownRef={envRef}
                    />
                    <CustomDropdown
                        isOpen={isClusterOpen}
                        setIsOpen={setIsClusterOpen}
                        options={filteredClusters}
                        value={selectedCluster}
                        onChange={setSelectedCluster}
                        searchValue={clusterSearchInput}
                        onSearchChange={setClusterSearchInput}
                        placeholder="Cluster"
                        dropdownRef={clusterRef}
                    />
                </div>
                <div className="search-wrapper">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search records..."
                        className="search-input"
                    />
                </div>
            </div>

            {loading && <div className="loading-message">Loading data...</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>DEPLOYMENT NAME</th>
                            <th>NAMESPACE</th>
                            <th>MAIN CONTAINER IMAGES</th>
                            <th>SIDE CONTAINER IMAGES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={index}>
                                <td>{row.deployment_name}</td>
                                <td>{row.namespace}</td>
                                <td>{row.main_container_images}</td>
                                <td>{row.side_container_images}</td>
                            </tr>
                        ))}
                        {!loading && paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={4} className="no-data">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination">
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    {"<<"}
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    Previous
                </button>
                <span>
                    Page {currentPage} of {totalPages || 1}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Next
                </button>
                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    {">>"}
                </button>
            </div>
        </div>
    );
}

export default FilteringTable;