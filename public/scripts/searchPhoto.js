var SORT_NONE = 0;
var SORT_UPLOAD_ASC = 1;
var SORT_UPLOAD_DESC = 2;
var API_KEY = ""; // Enter Flickr API key

var ResultGrid = React.createClass({
  sortPhotos: function(data, option){
    if (option == SORT_UPLOAD_ASC) {
      data.photos.photo.sort(function(photo1,photo2) {
        return photo1.dateuploaded - photo2.dateuploaded;
      });
    }else if (option == SORT_UPLOAD_DESC) {
      data.photos.photo.sort(function(photo1,photo2) {
        return photo2.dateuploaded - photo1.dateuploaded;
      });
    }
  },
  getPhotoInfo: function(data){
    if(data.photos){
      data.photos.photo.forEach(function(result) {
        $.ajax({
        url: "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key="+API_KEY+"&photo_id="+result.id+"&secret="+result.secret+"&format=json&nojsoncallback=1",
        dataType: 'json',
        cache: false,
        success: function(info) {
          result.dateuploaded = info.photo.dateuploaded;
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(status, err.toString());
        }.bind(this)
        });
      });
    }
  },
  handleSearchSubmit: function(searchText) {
    console.log(searchText);
    $.ajax({
      url: "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key="+API_KEY+"&text="+searchText.text+"&privacy_filter=1&per_page=15&format=json&nojsoncallback=1",
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log(data);
        this.getPhotoInfo(data);
        this.setState({data: data});
        $('#sortSelect')[0].selectedIndex = 0;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(status, err.toString());
      }.bind(this)
    });
  },
  handleSortChange: function(sort){
    console.log(parseInt(sort.sort));
    this.setState({sort: parseInt(sort.sort)});
    if (this.state.data.photos) this.sortPhotos(this.state.data, parseInt(sort.sort));
  },
  getInitialState: function() {
    return {data: [], sort: SORT_UPLOAD_ASC};
  },
  render: function() {
    return (
      <div className="resultGrid">
      <h1>Flickr Search and View</h1>
      <SortForm onSortChange={this.handleSortChange} />
      <SearchForm onSearchSubmit={this.handleSearchSubmit} />
      <hr />
      <ResultList data={this.state.data} />
      </div>
    );
  }
});

var ResultList = React.createClass({
  render: function() {
    if (this.props.data.photos){
      var resultNodes = this.props.data.photos.photo.map(function(result) {
        var photoUrl="https://farm"+result.farm+".staticflickr.com/"+result.server+"/"+result.id+"_"+result.secret+".jpg";
        return (
          <Photo title={result.title} photoUrl={photoUrl} key={result.id} id={result.id} />
        );
      });
      return (
        <div className="resultList">
          {resultNodes}
        </div>
      );
    }else{
      return (
        <div className="resultList">
        </div>
      );
    }
  }
});

var Photo = React.createClass({
  render: function() {
    return (
      <div className="photo">
        <a href={"#openModal"+this.props.id}><img src={this.props.photoUrl} className="thumbnail" /></a>
        <LargePhoto id={this.props.id} photoUrl={this.props.photoUrl} />
      </div>
    );
  }
});

var LargePhoto = React.createClass({
  render: function(){
    return (
      <div id={"openModal"+this.props.id} className="modalDialog">
      <div>
        <a href="#closeModal" title="Close" className="close">X</a>
        <img src={this.props.photoUrl} />
      </div>
      </div>
    );
  }
});

var SearchForm = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.onSearchSubmit({text: text});
    this.setState({text: ''});
  },
  render: function(){
    return (
      <div>
      <form className="searchForm" onSubmit={this.handleSubmit}>
        <input className="searchInput" type="text" placeholder="Search" value={this.state.text}
          onChange={this.handleTextChange} />
        <input className="searchButton" type="submit" value="Search" />
      </form>
      </div>
    );
  }
});

var SortForm = React.createClass({
  getInitialState: function(){
    return {sort:"recent"};
  },
  handleOptionChange: function(e){
    this.props.onSortChange({sort: e.target.selectedOptions[0].value});
  },
  render: function(){
    return (
      <div className="sortForm">
        <h6> Sort by: </h6> 
        <select id="sortSelect" onChange={this.handleOptionChange}>
          <option value={SORT_NONE}></option>
          <option value={SORT_UPLOAD_ASC}>Most Recent Date</option>
          <option value={SORT_UPLOAD_DESC}>Least Recent Date</option>
        </select>
      </div>
    );
  }
});

ReactDOM.render(
  <ResultGrid />,
  document.getElementById('content')
);