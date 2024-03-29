import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import classNames from "classnames";
import Http from "../Http";
import Article from "../components/Article";
import Alert from "../components/Alert";
import CommentBox from "../components/CommentBox";
import ReactPaginate from 'react-paginate';

const api = "/api/v1/reminder";

const image =
    "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22286%22%20height%3D%22180%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20286%20180%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_176f2c99c28%20text%20%7B%20fill%3Argba(255%2C255%2C255%2C.75)%3Bfont-weight%3Anormal%3Bfont-family%3AHelvetica%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_176f2c99c28%22%3E%3Crect%20width%3D%22286%22%20height%3D%22180%22%20fill%3D%22%23777%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22107.1953125%22%20y%3D%2296.3%22%3E286x180%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E";

const Archive = () => {
    const [loading, setLoading] = useState(false);
    const [responseState, setResponseState] = useState([]);
    const [moreLoaded, setMoreLoaded] = useState(false);
    const [apiMore, setApiMore] = useState(false);
    const [error, setError] = useState(false);


    const [articleState, setArticle] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [currentTypeSort, setCurrentTypeSort] = useState(false);
    const [postsPerPage] = useState(3);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const [filterPosts, setFilterPosts] = useState([]);
    const currentPosts = currentTypeSort ? filterPosts.slice(indexOfFirstPost, indexOfLastPost).reverse() : filterPosts.slice(indexOfFirstPost, indexOfLastPost);
    
    const paginate = ({ selected }) => {
        setCurrentPage(selected + 1);
    };


    useEffect(() => {
        Http.get(api)
            .then((response) => {
                const { data } = response.data;
                console.log(data);
                const apiM = response.data?.links?.next;
                setResponseState(data);
                setFilterPosts(data);
                setLoading(false);
                setError(false);
                setApiMore(apiM);
            })
            .catch((err) => {
                setError("Unable to fetch data.");
            });
    }, []);

    const handleClick = (article) => {
        setArticle(article);
    };

    const loadMore = () => {
        setLoading(true);
        Http.get(apiMore)
            .then((response) => {
                const { data } = response.data;
                const apiM = response.data.links.next;
                setResponseState([data, ...responseState]);
                setApiMore(apiM);
                setLoading(false);
                setError(false);
                setMoreLoaded(true);
            })
            .catch(() => {
                setError("Unable to fetch data.");
                setLoading(false);
            });
    };

    const onTextChanged = (e) =>{
        let buffer = responseState.filter(g => {
            return g.content.toLowerCase().search(e.target.value.trim().toLowerCase()) !== -1
        });

        setFilterPosts(buffer);
    }

    const changeSort = (e) => {
        e.target.value == 'time' ? setCurrentTypeSort(true) : setCurrentTypeSort(false)
    }

    return (
        <div className="container py-5">
            <h1 className="text-center mb-4">Все события</h1>
            {error && (
                <div className="text-center">
                    <p>{error}</p>
                </div>
            )}

            <div className="container py-5">
                <div className="row">
                    <div className="col-8">
                        {articleState.id && articleState.content ? (
                            <>
                                <Article article={articleState} />
                                {/* <CommentBox article_id={articleState.id} /> */}
                            </>
                        ) : (
                            <Alert />
                        )}
                    </div>
                    <div className="col-4">
                        <input placeholder="Поиск" onChange={onTextChanged} />
                        <center>
                            <div> Сортировать</div>
                            <select id="pet-select" onChange={changeSort}>
                                <option value="date">По дате</option>
                                <option value="time">По времени</option>                               
                            </select>
                        </center>
                        
                        
                        {currentPosts.length > 0 &&
                            currentPosts.map(
                                (article) =>
                                    article.id &&
                                    article.content?.length > 0 && (
                                        <div
                                            className="card my-2"
                                            key={article.id}
                                        >
                                            {/* <img
                                                className="card-img-top"
                                                src={
                                                    article?.image_url ?? image
                                                }
                                                alt={article?.slug}
                                            /> */}

                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    {article?.title}
                                                </h5>
                                                <p className="card-text">
                                                    {article?.content
                                                        .slice(0, 150)
                                                        .concat("...")}
                                                </p>
                                                <a
                                                    className="btn btn-outline-primary btn-block"
                                                    onClick={() =>
                                                        handleClick(article)
                                                    }
                                                >
                                                    Подробнее
                                                </a>

                                                <div className="container py-2">
                                                    <div className="row">
                                                        <span className="badge badge-success mx-auto">
                                                            {article?.slug}
                                                        </span>
                                                        {/* <span className="badge badge-warning mx-auto">
                                                            {
                                                                article?.cat_id
                                                                    ?.label
                                                            }
                                                        </span> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                    
                    <ReactPaginate
                        onPageChange={paginate}
                        pageCount={Math.ceil(filterPosts.length / postsPerPage)}
                        previousLabel={'Prev'}
                        nextLabel={'Next'}
                        containerClassName={'pagination'}
                        pageLinkClassName={'page-number'}
                        previousLinkClassName={'page-number'}
                        nextLinkClassName={'page-number'}
                        activeLinkClassName={'active'}
                    />
                    
                    </div>
                </div>
            </div>

            {apiMore && (
                <div className="text-center">
                    <button
                        className={classNames("btn btn-primary", {
                            "btn-loading": loading,
                        })}
                        onClick={loadMore}
                    >
                        Load More
                    </button>
                </div>
            )}

            {!apiMore && moreLoaded === true && (
                <div className="text-center">
                    <p>Everything loaded.</p>
                </div>
            )}
        </div>
    );
};

Archive.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(Archive);
